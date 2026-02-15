import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { MosqueHeader } from '@/components/islam/MosqueHeader';
import { PrayerGrid } from '@/components/islam/PrayerGrid';
import { PrayerList } from '@/components/islam/PrayerList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIslamPrayerData } from '@/hooks/use-islam-prayer-data';
import { useTradition } from '@/hooks/use-tradition';
import { useUser } from '@/hooks/use-user';
import { formatTime } from '@/lib/prayer-times';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { tradition } = useTradition();
  const { userName } = useUser();
  console.log('HomeScreen rendered - file clean');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <IconSymbol name="spa" size={28} color={theme.primary} />
              <ThemedText style={styles.headerTitleText}>PRAYER FOCUS</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <IconSymbol name="person" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {tradition === 'islam' ? (
        <IslamHome userName={userName} />
      ) : (
        <LegacyHome tradition={tradition} userName={userName} />
      )}
    </ThemedView>
  );
}

function IslamHome({ userName }: { userName: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminderStatusMessage, setReminderStatusMessage] = useState<string | null>(null);
  const [activeReminders, setActiveReminders] = React.useState<Set<string>>(new Set());
  const router = useRouter();

  const {
    todayPrayers,
    nextPrayer,
    currentPrayerName,
    todayCompletion,
    completedCount,
    progress,
    locationText,
    countdownText,
    requestLocationPermission,
    togglePrayerCompletion,
  } = useIslamPrayerData(selectedDate);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const fetchActiveReminders = React.useCallback(async () => {
    try {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const reminderIds = new Set(
        pending
          .filter((n) => n.content.data?.feature === 'islam-prayer-session')
          .map((n) => n.content.data?.reminderId as string)
          .filter(Boolean),
      );
      setActiveReminders(reminderIds);
    } catch (error) {
      console.error('Failed to fetch active reminders:', error);
    }
  }, []);

  React.useEffect(() => {
    void fetchActiveReminders();
  }, [fetchActiveReminders]);

  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const ensureReminderPermission = async () => {
    await Notifications.setNotificationChannelAsync('prayer-reminders', {
      name: 'Prayer reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });

    const existingPermission = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermission.status;
    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    return finalStatus === 'granted';
  };

  const schedulePrayerReminder = async (prayer: { name: string; label: string; time: Date }) => {
    setReminderStatusMessage(null);

    try {
      const granted = await ensureReminderPermission();
      if (!granted) {
        setReminderStatusMessage('Notifications are blocked. Enable notifications in settings.');
        return;
      }

      const scheduleDate = getNextReminderDate(prayer.time);
      const reminderId = getReminderId(prayer.name, scheduleDate);
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const existingReminder = pending.find(
        (notification) =>
          notification.content.data?.feature === 'islam-prayer-session' &&
          notification.content.data?.reminderId === reminderId,
      );

      if (existingReminder) {
        await Notifications.cancelScheduledNotificationAsync(existingReminder.identifier);
        await fetchActiveReminders();
        setReminderStatusMessage(`Reminder cancelled for ${prayer.label}.`);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer.label} prayer reminder`,
          body: `It is time for ${prayer.label}.`,
          sound: 'default',
          data: {
            feature: 'islam-prayer-session',
            prayer: prayer.name,
            reminderId,
            prayerTime: scheduleDate.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduleDate,
        },
      });

      await fetchActiveReminders();
      setReminderStatusMessage(`Reminder set for ${prayer.label} at ${formatTime(scheduleDate)}.`);
    } catch (error) {
      console.error('Failed to schedule prayer reminder:', error);
      setReminderStatusMessage('Could not set reminder right now. Please try again.');
    }
  };

  const currentPrayer = todayPrayers.find((p) => p.name === currentPrayerName);

  // Prepare data for child components
  const nextPrayerTimeFormatted = nextPrayer ? formatTime(nextPrayer.time) : '--:--';
  const [nextTime, nextPeriod] = nextPrayerTimeFormatted.split(' ');

  const prayersWithTime = todayPrayers.map((p) => ({
    ...p,
    formattedTime: formatTime(p.time),
  }));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <MosqueHeader
        nextPrayerName={nextPrayer?.label || 'None'}
        nextPrayerTime={nextTime || '--:--'}
        period={(nextPeriod as 'am' | 'pm') || 'am'}
        timeRemaining={countdownText}
        date={selectedDate.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
        location={locationText}
      />

      <PrayerGrid
        currentPrayer={currentPrayer}
        nextPrayer={nextPrayer ? { ...nextPrayer, timeRemaining: countdownText } : undefined}
        progress={progress}
        completedCount={completedCount}
      />

      <PrayerList
        date={selectedDate}
        isToday={isToday}
        onDateChange={changeDate}
        prayers={prayersWithTime}
        completions={todayCompletion}
        currentPrayerName={currentPrayerName}
        nextPrayerName={nextPrayer?.name ?? null}
        onToggle={togglePrayerCompletion}
        activeReminders={activeReminders}
        onToggleReminder={schedulePrayerReminder}
      />

      {reminderStatusMessage && (
        <View style={{ padding: 16 }}>
          <ThemedText style={styles.reminderStatusText}>{reminderStatusMessage}</ThemedText>
        </View>
      )}

      {/* Permissions banner if needed */}
      {locationText === 'Permission required' && (
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => void requestLocationPermission()}
        >
          <ThemedText style={styles.permissionButtonText}>Enable Location</ThemedText>
        </TouchableOpacity>
      )}

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

function LegacyHome({ tradition, userName }: { tradition: string | null; userName: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <ThemedText style={styles.greetingText}>
          Peace be with you, {'\n'}
          <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>{userName}</ThemedText>
        </ThemedText>
        <ThemedText style={styles.subGreetingText}>Ready to find your center today?</ThemedText>
      </View>

      <View style={styles.section}>
        {tradition === 'christianity' && (
          <TraditionActionCard
            title="Daily Scripture"
            subtitle="Verse of the day"
            icon="book.fill"
            color="#3b82f6"
            onPress={() => router.push('/tradition/christian')}
          />
        )}
        {tradition === 'buddhism' && (
          <TraditionActionCard
            title="Chants & Mantras"
            subtitle="Meditation & Sutras"
            icon="spa"
            color="#f59e0b"
            onPress={() => router.push('/tradition/buddhist')}
          />
        )}

        <TraditionActionCard
          title="Quiet Reflection"
          subtitle="Universal mindfulness"
          icon="brain.headset"
          color="#a855f7"
          onPress={() => router.push('/tradition/general')}
        />
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function TraditionActionCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  color: string;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 12 }}>
      <Card
        variant="default"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 16,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#333' : '#e2e8f0',
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${color}1A`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
            {title}
          </ThemedText>
          <ThemedText style={{ color: '#64748b', fontSize: 14 }}>{subtitle}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#64748b" />
      </Card>
    </TouchableOpacity>
  );
}

function getPrayerSessionIcon(prayerName: string): string {
  switch (prayerName) {
    case 'fajr':
      return '🌙';
    case 'dhuhr':
      return '☀️';
    case 'asr':
      return '🌤️';
    case 'maghrib':
      return '🌇';
    case 'isha':
      return '✨';
    default:
      return '🕊️';
  }
}

function getNextReminderDate(prayerTime: Date): Date {
  const now = new Date();
  const scheduleDate = new Date(prayerTime);
  if (scheduleDate.getTime() <= now.getTime()) {
    scheduleDate.setDate(scheduleDate.getDate() + 1);
  }
  return scheduleDate;
}

function getReminderId(prayerName: string, scheduleDate: Date): string {
  const dateKey = scheduleDate.toISOString().slice(0, 10);
  return `${prayerName}:${dateKey}`;
}

const UPCOMING_ISLAMIC_DAYS = [
  { date: 'Feb 19', label: 'Ramadan' },
  { date: 'Mar 09', label: 'Laylat al-Qadr' },
  { date: 'Mar 20', label: 'Eid ul-Fitr' },
  { date: 'May 27', label: 'Eid ul-Adha' },
];

const DUA_OF_THE_DAY = {
  title: 'Remove fear from Heart',
  arabic:
    'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
  translation:
    'Say, "I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer..."',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
  },
  headerTitleText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    color: '#64748b',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  islamHero: {
    marginHorizontal: 18,
    borderRadius: 30,
    padding: 20,
    backgroundColor: '#4d9a61',
    gap: 10,
  },
  islamTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  islamSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    fontWeight: '600',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d8f3dc',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationPillText: {
    fontSize: 12,
    color: '#1f6a45',
    fontWeight: '700',
  },
  upcomingWrap: {
    marginTop: 6,
    gap: 3,
  },
  upcomingLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upcomingName: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  upcomingTime: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  upcomingCountdown: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: 'rgba(146, 64, 14, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  permissionButtonText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '700',
  },
  permissionError: {
    color: '#fee2e2',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 18,
    marginTop: 14,
  },
  nextCard: {
    borderRadius: 20,
    backgroundColor: '#0f172a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextCardLabel: {
    color: '#86efac',
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  nextCardTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginTop: 4,
  },
  nextCardMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  progressCard: {
    padding: 16,
    borderRadius: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressSubtitle: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
  },
  prayerListCard: {
    borderRadius: 20,
    padding: 12,
    gap: 2,
  },
  prayerListTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  prayerHint: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  prayerRow: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  prayerRowComplete: {
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  prayerRowFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  prayerBellButton: {
    padding: 6,
    margin: -6,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  prayerTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  prayerSessionIcon: {
    fontSize: 13,
    lineHeight: 16,
  },
  prayerTime: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  nowBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  nextBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subGreetingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroGoalText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  miniProgressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  profileButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  profileButtonText: {
    color: '#4d9a61',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationPillTextLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 12,
    marginTop: 14,
  },
  halfCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardMainValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardMainValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardMainPrayerIcon: {
    fontSize: 16,
    lineHeight: 20,
  },
  cardSubValue: {
    fontSize: 14,
    color: '#64748b',
  },
  cardEmptyMessage: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  islamicDayCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    gap: 4,
  },
  islamicDayDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  islamicDayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    padding: 16,
    borderRadius: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  bannerDescription: {
    fontSize: 13,
    color: '#3b82f6',
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  bannerButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  duaCard: {
    padding: 20,
    borderRadius: 24,
    gap: 12,
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duaBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  duaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  duaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  duaArabic: {
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'right',
    marginTop: 8,
  },
  duaTranslation: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reminderStatusText: {
    marginTop: 10,
    marginHorizontal: 8,
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
});
