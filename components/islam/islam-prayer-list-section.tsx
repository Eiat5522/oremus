import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { PrayerActionSheet, PrayerActionSheetRef } from '@/components/islam/PrayerActionSheet';
import { PrayerList } from '@/components/islam/PrayerList';
import { PrayerRescheduleModal } from '@/components/islam/PrayerRescheduleModal';
import { ThemedText } from '@/components/themed-text';
import { useIslamPrayerData } from '@/hooks/use-islam-prayer-data';
import type { PrayerName } from '@/lib/prayer-times';
import { formatTime } from '@/lib/prayer-times';
import { isPrayerSessionPassed } from '@/lib/prayer-session';

export function IslamPrayerListSection() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminderStatusMessage, setReminderStatusMessage] = useState<string | null>(null);
  const [activeReminders, setActiveReminders] = React.useState<Set<string>>(new Set());
  const [selectedPrayer, setSelectedPrayer] = useState<{
    name: PrayerName;
    label: string;
    time: Date;
  } | null>(null);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const actionSheetRef = useRef<PrayerActionSheetRef>(null);

  const {
    now,
    todayPrayers,
    nextPrayer,
    currentPrayerName,
    todayCompletion,
    locationText,
    requestLocationPermission,
    togglePrayerCompletion,
    todayRescheduled,
    reschedulePrayer,
    refreshPrayerData,
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

  useFocusEffect(
    React.useCallback(() => {
      void refreshPrayerData();
      void fetchActiveReminders();
    }, [fetchActiveReminders, refreshPrayerData]),
  );

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

  const schedulePrayerReminder = async (
    prayer: { name: string; label: string; time: Date },
    minutesBefore: number = 15,
  ) => {
    setReminderStatusMessage(null);

    try {
      const granted = await ensureReminderPermission();
      if (!granted) {
        setReminderStatusMessage('Notifications are blocked. Enable notifications in settings.');
        return;
      }

      const scheduleDate = new Date(prayer.time);
      scheduleDate.setMinutes(scheduleDate.getMinutes() - minutesBefore);

      if (scheduleDate.getTime() <= new Date().getTime()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const reminderId = `${prayer.name}:${scheduleDate.toISOString().slice(0, 10)}:${minutesBefore}`;
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const existingReminder = pending.find(
        (notification) =>
          notification.content.data?.feature === 'islam-prayer-session' &&
          notification.content.data?.prayer === prayer.name &&
          notification.content.data?.reminderMinutes === minutesBefore,
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
          body: `${prayer.label} is in ${minutesBefore} minutes.`,
          sound: 'default',
          data: {
            feature: 'islam-prayer-session',
            prayer: prayer.name,
            reminderId,
            reminderMinutes: minutesBefore,
            reminderTriggerTime: scheduleDate.toISOString(),
            prayerTime: prayer.time.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduleDate,
        },
      });

      await fetchActiveReminders();
      setReminderStatusMessage(`Reminder set for ${prayer.label} (${minutesBefore} min before).`);
    } catch (error) {
      console.error('Failed to schedule prayer reminder:', error);
      setReminderStatusMessage('Could not set reminder right now. Please try again.');
    }
  };

  const isPrayerLocked = React.useCallback(
    (prayer: { name: PrayerName; time: Date }) => {
      const index = todayPrayers.findIndex((entry) => entry.name === prayer.name);
      if (index < 0) {
        return false;
      }

      return isPrayerSessionPassed(
        todayPrayers,
        index,
        now,
        isToday,
        todayCompletion[prayer.name] ?? false,
        prayer.name in todayRescheduled,
      );
    },
    [isToday, now, todayCompletion, todayPrayers, todayRescheduled],
  );

  const selectedPrayerIsLocked = useMemo(() => {
    if (!selectedPrayer) {
      return false;
    }
    return isPrayerLocked(selectedPrayer);
  }, [isPrayerLocked, selectedPrayer]);

  const handleOpenActionSheet = (prayer: { name: PrayerName; label: string; time: Date }) => {
    if (isPrayerLocked(prayer)) {
      return;
    }
    setSelectedPrayer(prayer);
    actionSheetRef.current?.open();
  };

  const handleSetNotification = (minutes: number) => {
    if (selectedPrayer && !selectedPrayerIsLocked) {
      void schedulePrayerReminder(selectedPrayer, minutes);
    }
  };

  const handleReschedule = () => {
    if (selectedPrayer && !selectedPrayerIsLocked) {
      setIsRescheduleModalVisible(true);
    }
  };

  const handleToggleComplete = () => {
    if (selectedPrayer && !selectedPrayerIsLocked) {
      togglePrayerCompletion(selectedPrayer.name);
    }
  };

  const handleSaveReschedule = (newTime: Date, withReminder: boolean, reminderMinutes: number) => {
    if (selectedPrayer && !selectedPrayerIsLocked) {
      reschedulePrayer(selectedPrayer.name, newTime, withReminder, reminderMinutes);
      if (withReminder) {
        void schedulePrayerReminder({ ...selectedPrayer, time: newTime }, reminderMinutes);
      } else {
        setReminderStatusMessage(`${selectedPrayer.label} rescheduled to ${formatTime(newTime)}.`);
      }
    }
  };

  const getNextPrayerTime = (): Date | null => {
    if (!selectedPrayer) return null;
    const currentIndex = todayPrayers.findIndex((p) => p.name === selectedPrayer.name);
    const nextPrayerItem = todayPrayers[currentIndex + 1];
    return nextPrayerItem ? nextPrayerItem.time : null;
  };

  const prayersWithTime = todayPrayers.map((p) => ({
    ...p,
    formattedTime: formatTime(p.time),
  }));

  return (
    <>
      <PrayerList
        date={selectedDate}
        isToday={isToday}
        onDateChange={changeDate}
        prayers={prayersWithTime}
        completions={todayCompletion}
        currentPrayerName={currentPrayerName}
        nextPrayerName={nextPrayer?.name ?? null}
        now={now}
        rescheduledPrayers={todayRescheduled}
        onOpenActionSheet={handleOpenActionSheet}
        activeReminders={activeReminders}
        onToggleReminder={schedulePrayerReminder}
      />

      {reminderStatusMessage ? (
        <View style={styles.statusWrap}>
          <ThemedText style={styles.reminderStatusText}>{reminderStatusMessage}</ThemedText>
        </View>
      ) : null}

      {locationText === 'Permission required' ? (
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => void requestLocationPermission()}
        >
          <ThemedText style={styles.permissionButtonText}>Enable Location</ThemedText>
        </TouchableOpacity>
      ) : null}

      <View style={styles.bottomSpacer} />

      {selectedPrayer ? (
        <PrayerActionSheet
          ref={actionSheetRef}
          prayerName={selectedPrayer.name}
          prayerLabel={selectedPrayer.label}
          isCompleted={todayCompletion[selectedPrayer.name] ?? false}
          isSessionPassed={selectedPrayerIsLocked}
          onSetNotification={handleSetNotification}
          onReschedule={handleReschedule}
          onToggleComplete={handleToggleComplete}
        />
      ) : null}

      {selectedPrayer ? (
        <PrayerRescheduleModal
          visible={isRescheduleModalVisible}
          prayerName={selectedPrayer.name}
          prayerLabel={selectedPrayer.label}
          originalTime={selectedPrayer.time}
          nextPrayerTime={getNextPrayerTime()}
          onClose={() => setIsRescheduleModalVisible(false)}
          onSave={handleSaveReschedule}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  statusWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  reminderStatusText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginHorizontal: 16,
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
  bottomSpacer: {
    height: 92,
  },
});
