import React from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { AnimatedBell } from '@/components/animated-bell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PrayerName } from '@/lib/prayer-times';

const { width } = Dimensions.get('window');

function getPrayerIcon(prayerName: PrayerName): string {
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

function getReminderId(prayerName: string, prayerTime: Date): string {
  const scheduleDate = new Date(prayerTime);
  if (scheduleDate.getTime() <= new Date().getTime()) {
    scheduleDate.setDate(scheduleDate.getDate() + 1);
  }
  const dateKey = scheduleDate.toISOString().slice(0, 10);
  return `${prayerName}:${dateKey}`;
}

// Check if any reminder is active for this prayer (regardless of minutes)
function isReminderActiveForPrayer(
  prayerName: string,
  prayerTime: Date,
  activeReminders: Set<string>,
): boolean {
  const baseId = getReminderId(prayerName, prayerTime);
  // Check if any reminder ID starts with the base ID (which would include any minutes suffix)
  for (const reminderId of activeReminders) {
    if (reminderId.startsWith(baseId)) {
      return true;
    }
  }
  return false;
}

type PrayerListProps = {
  date: Date;
  isToday: boolean;
  onDateChange: (days: number) => void;
  prayers: { name: PrayerName; label: string; time: Date; formattedTime: string }[];
  completions: Record<PrayerName, boolean>;
  currentPrayerName: PrayerName | null;
  nextPrayerName: PrayerName | null;
  now: Date;
  rescheduledPrayers: Record<
    PrayerName,
    { time: string; hasReminder: boolean; reminderMinutes: number }
  >;
  onOpenActionSheet: (prayer: { name: PrayerName; label: string; time: Date }) => void;
  activeReminders: Set<string>;
  onToggleReminder: (prayer: { name: string; label: string; time: Date }) => void;
};

export function PrayerList({
  date,
  isToday,
  onDateChange,
  prayers,
  completions,
  currentPrayerName,
  nextPrayerName,
  now,
  rescheduledPrayers,
  onOpenActionSheet,
  activeReminders,
  onToggleReminder,
}: PrayerListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const dateLabel = isToday
    ? 'Today'
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 50;

  const handleSwipe = (direction: number) => {
    onDateChange(direction);
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          // Swiped right - go to previous day
          runOnJS(handleSwipe)(-1);
        } else {
          // Swiped left - go to next day
          runOnJS(handleSwipe)(1);
        }
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }],
  }));

  // Helper function to determine if a prayer should show red X (missed)
  const isPrayerMissed = (prayer: { name: PrayerName; time: Date }, index: number): boolean => {
    // Only check for today
    if (!isToday) return false;

    const isComplete = completions[prayer.name];
    const isRescheduled = prayer.name in rescheduledPrayers;

    // If completed or rescheduled, don't show red X
    if (isComplete || isRescheduled) return false;

    // Get the next prayer in the list
    const nextPrayer = prayers[index + 1];

    // For the last prayer (e.g., Isha), use midnight (end of day) as the cutoff
    if (!nextPrayer) {
      // Calculate midnight (start of next day)
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      // If current time has passed midnight (i.e., we're into the next day), the prayer is missed
      return now.getTime() >= midnight.getTime();
    }

    // Prayer is missed if current time has passed the next prayer's time
    // (meaning we missed the window for this prayer)
    const nextPrayerTime = new Date(nextPrayer.time);
    return now.getTime() > nextPrayerTime.getTime();
  };

  return (
    <View style={styles.container}>
      {/* Header with Swipe Gesture */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.header, animatedStyle]}>
          <View style={styles.dateDisplay}>
            <IconSymbol
              name="chevron.left"
              size={14}
              color={theme.textSecondary || theme.text}
              style={styles.swipeHint}
            />
            <ThemedText style={styles.dateLabel}>{dateLabel}</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={14}
              color={theme.textSecondary || theme.text}
              style={styles.swipeHint}
            />
          </View>
          <ThemedText style={styles.swipeHintText}>Swipe to change date</ThemedText>
        </Animated.View>
      </GestureDetector>

      {/* List */}
      <View style={styles.list}>
        {prayers.map((prayer, index) => {
          const isComplete = completions[prayer.name];
          const isCurrent = currentPrayerName === prayer.name;
          const isNext = nextPrayerName === prayer.name;
          const isMissed = isPrayerMissed(prayer, index);
          const isRescheduled = prayer.name in rescheduledPrayers;
          const isReminderActive = isReminderActiveForPrayer(
            prayer.name,
            prayer.time,
            activeReminders,
          );

          return (
            <TouchableOpacity
              key={prayer.name}
              style={[
                styles.row,
                isCurrent && styles.currentRow,
                isComplete && styles.completeRow,
                isMissed && styles.missedRow,
              ]}
              onPress={() => onOpenActionSheet(prayer)}
              activeOpacity={0.7}
            >
              <View style={styles.leftContent}>
                <ThemedText style={[styles.prayerName, isCurrent && styles.currentText]}>
                  {prayer.label}
                </ThemedText>

                <ThemedText style={[styles.prayerIcon, isCurrent && styles.currentText]}>
                  {getPrayerIcon(prayer.name)}
                </ThemedText>

                {isComplete && (
                  <View style={styles.checkIcon}>
                    <IconSymbol name="checkmark" size={14} color="#ffffff" />
                  </View>
                )}

                {isMissed && (
                  <View style={styles.missedIcon}>
                    <IconSymbol name="close" size={14} color="#ffffff" />
                  </View>
                )}

                <ThemedText style={[styles.prayerTime, isCurrent && styles.currentText]}>
                  {prayer.formattedTime}
                </ThemedText>

                {isRescheduled && (
                  <View style={styles.rescheduledBadge}>
                    <ThemedText style={styles.rescheduledText}>Rescheduled</ThemedText>
                  </View>
                )}

                {isCurrent && (
                  <View style={styles.nowBadge}>
                    <IconSymbol name="sun.max.fill" size={14} color="#fcd34d" />
                    <ThemedText style={styles.nowText}>Now</ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.rightContent}>
                <AnimatedBell
                  size={20}
                  isActive={isReminderActive}
                  activeColor="#fbbf24"
                  color={isCurrent ? '#ffffff' : theme.icon}
                  onPress={() => onToggleReminder(prayer)}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dua Card */}
      <Card style={styles.duaCard}>
        <View style={styles.duaHeader}>
          <IconSymbol name="moon.stars" size={20} color="#cbd5e1" style={{ marginRight: 8 }} />
          <ThemedText style={styles.duaText} numberOfLines={1}>
            Dua of the day: Remove fear from Heart...
          </ThemedText>
        </View>
        <ThemedText style={styles.duaSubText}>Isyak</ThemedText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeHint: {
    opacity: 0.5,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  arrows: {
    flexDirection: 'row',
    gap: 16,
  },
  arrowButton: {
    padding: 4,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // Dark transparent background
  },
  currentRow: {
    backgroundColor: '#1e4e3c', // Green highlight
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  completeRow: {
    opacity: 0.8,
  },
  missedRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 60,
  },
  prayerIcon: {
    fontSize: 14,
  },
  prayerTime: {
    fontSize: 16,
    fontFamily: 'monospace', // To align times better
  },
  currentText: {
    color: '#ffffff',
  },
  checkIcon: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missedIcon: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduledBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rescheduledText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  nowText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duaCard: {
    marginTop: 24,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  duaText: {
    fontSize: 14,
    color: '#e2e8f0',
    flex: 1,
  },
  duaSubText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginLeft: 28, // Align with text start
  },
});
