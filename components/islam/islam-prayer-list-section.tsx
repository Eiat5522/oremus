import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrayerActionSheet, type PrayerActionSheetRef } from '@/components/islam/PrayerActionSheet';
import { PrayerLocationSettingsCard } from '@/components/islam/prayer-location-settings-card';
import { PrayerDayHeader } from '@/components/islam/prayer-day-header';
import { PrayerDayRow, type PrayerRowModel } from '@/components/islam/prayer-day-row';
import { PrayerProgressRing } from '@/components/islam/prayer-progress-ring';
import { QiblaPill } from '@/components/islam/qibla-pill';
import { PrayerRescheduleModal } from '@/components/islam/PrayerRescheduleModal';
import { ThemedText } from '@/components/themed-text';
import { PrayerAtmosphere } from '@/components/visual/prayer-atmosphere';
import { Starfield } from '@/components/visual/starfield';
import { Fonts } from '@/constants/theme';
import { useIslamPrayerData } from '@/hooks/use-islam-prayer-data';
import type { PrayerName } from '@/lib/prayer-times';
import { formatTime } from '@/lib/prayer-times';
import { isPrayerSessionPassed } from '@/lib/prayer-session';

type SelectedPrayer = {
  name: PrayerName;
  label: string;
  time: Date;
};

function getDisplayStatusText(
  prayer: {
    name: PrayerName;
    label: string;
    time: Date;
  },
  status: PrayerRowModel['status'],
  countdownText: string,
) {
  if (status === 'completed') return 'Completed';
  if (status === 'current') return 'Now';
  if (status === 'next') return countdownText;
  if (status === 'missed') return 'Missed';
  return 'Upcoming';
}

function formatIslamicDate(date: Date) {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}

function withDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

export function IslamPrayerListSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const actionSheetRef = useRef<PrayerActionSheetRef>(null);
  const shouldOpenActionSheetRef = useRef(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminderStatusMessage, setReminderStatusMessage] = useState<string | null>(null);
  const [activeReminders, setActiveReminders] = useState<Set<string>>(new Set());
  const [selectedPrayer, setSelectedPrayer] = useState<SelectedPrayer | null>(null);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const {
    now,
    todayPrayers,
    nextPrayer,
    currentPrayerName,
    todayCompletion,
    completedCount,
    countdownText,
    locationText,
    locationError,
    locationPermissionStatus,
    canAskLocationPermission,
    isRequestingLocationPermission,
    requestLocationPermission,
    savedPrayerLocation,
    selectSavedPrayerLocation,
    clearSavedPrayerLocation,
    isUsingDeviceLocation,
    togglePrayerCompletion,
    todayRescheduled,
    reschedulePrayer,
    refreshPrayerData,
  } = useIslamPrayerData(selectedDate);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const title = formatIslamicDate(selectedDate);

  const fetchActiveReminders = useCallback(async () => {
    try {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const reminderIds = new Set(
        pending
          .filter((notification) => notification.content.data?.feature === 'islam-prayer-session')
          .map((notification) => notification.content.data?.reminderId as string)
          .filter(Boolean),
      );
      setActiveReminders(reminderIds);
    } catch (error) {
      console.error('Failed to fetch active reminders:', error);
    }
  }, []);

  useEffect(() => {
    void fetchActiveReminders();
  }, [fetchActiveReminders]);

  useFocusEffect(
    useCallback(() => {
      void refreshPrayerData();
      void fetchActiveReminders();
    }, [fetchActiveReminders, refreshPrayerData]),
  );

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

  const schedulePrayerReminder = async (prayer: SelectedPrayer, minutesBefore = 15) => {
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

  const isPrayerLocked = useCallback(
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

  const handlePrimaryPress = useCallback(
    (prayer: SelectedPrayer) => {
      if (!isPrayerLocked(prayer)) {
        togglePrayerCompletion(prayer.name);
      }
    },
    [isPrayerLocked, togglePrayerCompletion],
  );

  const handleOpenActions = useCallback((prayer: SelectedPrayer) => {
    shouldOpenActionSheetRef.current = true;
    setSelectedPrayer(prayer);
  }, []);

  useEffect(() => {
    if (!selectedPrayer || !shouldOpenActionSheetRef.current) {
      return;
    }

    shouldOpenActionSheetRef.current = false;
    actionSheetRef.current?.open();
  }, [selectedPrayer]);

  const handleSaveReschedule = (newTime: Date, withReminder: boolean, reminderMinutes: number) => {
    if (!selectedPrayer || isPrayerLocked(selectedPrayer)) {
      return;
    }

    reschedulePrayer(selectedPrayer.name, newTime, withReminder, reminderMinutes);
    if (withReminder) {
      void schedulePrayerReminder({ ...selectedPrayer, time: newTime }, reminderMinutes);
    } else {
      setReminderStatusMessage(`${selectedPrayer.label} rescheduled to ${formatTime(newTime)}.`);
    }
  };

  const getNextPrayerTime = (): Date | null => {
    if (!selectedPrayer) return null;
    const currentIndex = todayPrayers.findIndex((prayer) => prayer.name === selectedPrayer.name);
    const nextItem = todayPrayers[currentIndex + 1];
    return nextItem ? nextItem.time : null;
  };

  const rows = useMemo<PrayerRowModel[]>(() => {
    return todayPrayers.map((prayer, index) => {
      const rescheduled = todayRescheduled[prayer.name];
      const displayTime = rescheduled ? new Date(rescheduled.time) : prayer.time;
      const isLocked = isPrayerSessionPassed(
        todayPrayers,
        index,
        now,
        isToday,
        todayCompletion[prayer.name] ?? false,
        prayer.name in todayRescheduled,
      );

      let status: PrayerRowModel['status'] = 'upcoming';
      if (todayCompletion[prayer.name]) {
        status = 'completed';
      } else if (currentPrayerName === prayer.name) {
        status = 'current';
      } else if (nextPrayer?.name === prayer.name) {
        status = 'next';
      } else if (isLocked) {
        status = 'missed';
      }

      return {
        name: prayer.name,
        label: prayer.label,
        formattedTime: formatTime(displayTime),
        status,
        secondaryLabel: getDisplayStatusText(prayer, status, countdownText),
        isRescheduled: Boolean(rescheduled),
        isReminderActive: Array.from(activeReminders).some((reminderId) =>
          reminderId.startsWith(`${prayer.name}:`),
        ),
        isLocked,
      };
    });
  }, [
    activeReminders,
    countdownText,
    currentPrayerName,
    isToday,
    nextPrayer?.name,
    now,
    todayCompletion,
    todayPrayers,
    todayRescheduled,
  ]);

  const showLocationAction =
    locationPermissionStatus !== 'granted' &&
    !savedPrayerLocation &&
    (locationText === 'Permission required' || locationText === 'Location access required');

  return (
    <PrayerAtmosphere>
      <Starfield width={width} height={height} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 12) + 8,
            paddingBottom: 132 + insets.bottom,
          },
        ]}
      >
        <PrayerDayHeader
          title={title}
          location={locationText}
          onPreviousDay={() => setSelectedDate((current) => withDays(current, -1))}
          onNextDay={() => setSelectedDate((current) => withDays(current, 1))}
          onPickDate={() => setIsDatePickerVisible(true)}
          onRequestLocation={() => void requestLocationPermission()}
          showLocationAction={showLocationAction}
        />

        <PrayerProgressRing completed={completedCount} total={5} />

        <PrayerLocationSettingsCard
          canAskLocationPermission={canAskLocationPermission}
          clearSavedPrayerLocation={clearSavedPrayerLocation}
          isRequestingLocationPermission={isRequestingLocationPermission}
          isUsingDeviceLocation={isUsingDeviceLocation}
          locationError={locationError}
          locationPermissionStatus={locationPermissionStatus}
          locationText={locationText}
          onManagePresetsPress={() => router.push('/profile')}
          requestLocationPermission={requestLocationPermission}
          savedPrayerLocation={savedPrayerLocation}
          selectSavedPrayerLocation={selectSavedPrayerLocation}
        />

        <View style={styles.list}>
          {rows.map((row) => {
            const basePrayer =
              todayPrayers.find((prayer) => prayer.name === row.name) ??
              ({ name: row.name, label: row.label, time: new Date() } as SelectedPrayer);
            const selectedTime = todayRescheduled[row.name]
              ? new Date(todayRescheduled[row.name].time)
              : basePrayer.time;

            return (
              <PrayerDayRow
                key={row.name}
                prayer={row}
                onActionPress={() =>
                  handleOpenActions({ name: row.name, label: row.label, time: selectedTime })
                }
                onStatusPress={() =>
                  handlePrimaryPress({ name: row.name, label: row.label, time: selectedTime })
                }
                onLongPress={() =>
                  handleOpenActions({ name: row.name, label: row.label, time: selectedTime })
                }
              />
            );
          })}
        </View>

        {reminderStatusMessage ? (
          <View style={styles.messageWrap}>
            <ThemedText style={styles.messageText}>{reminderStatusMessage}</ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.qiblaWrap, { bottom: 92 + insets.bottom }]}>
        <QiblaPill onPress={() => router.push('/qibla')} />
      </View>

      {isDatePickerVisible ? (
        Platform.OS === 'ios' ? (
          <Modal
            transparent
            animationType="fade"
            onRequestClose={() => setIsDatePickerVisible(false)}
          >
            <View style={styles.dateOverlay}>
              <View style={styles.dateCard}>
                <ThemedText style={styles.dateCardTitle}>Choose date</ThemedText>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={(_, value) => {
                    if (value) {
                      setSelectedDate(value);
                    }
                  }}
                  themeVariant="dark"
                />
                <Pressable
                  onPress={() => setIsDatePickerVisible(false)}
                  style={styles.dateCardButton}
                >
                  <ThemedText style={styles.dateCardButtonText}>Done</ThemedText>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, value) => {
              setIsDatePickerVisible(false);
              if (event.type === 'set' && value) {
                setSelectedDate(value);
              }
            }}
          />
        )
      ) : null}

      <PrayerActionSheet
        ref={actionSheetRef}
        prayerName={selectedPrayer?.name}
        prayerLabel={selectedPrayer?.label}
        isCompleted={selectedPrayer ? (todayCompletion[selectedPrayer.name] ?? false) : false}
        isSessionPassed={selectedPrayer ? isPrayerLocked(selectedPrayer) : false}
        onSetNotification={(minutes) => {
          if (selectedPrayer) {
            void schedulePrayerReminder(selectedPrayer, minutes);
          }
        }}
        onReschedule={() => {
          if (selectedPrayer) {
            setIsRescheduleModalVisible(true);
          }
        }}
        onToggleComplete={() => {
          if (selectedPrayer) {
            handlePrimaryPress(selectedPrayer);
          }
        }}
        onClose={() => {
          setIsRescheduleModalVisible(false);
          setSelectedPrayer(null);
        }}
        onBeginSession={() => {
          if (selectedPrayer) {
            router.push({
              pathname: '/tradition/islam-session',
              params: { prayerName: selectedPrayer.name },
            });
          }
        }}
      />
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
    </PrayerAtmosphere>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    gap: 14,
  },
  list: {
    gap: 12,
  },
  messageWrap: {
    marginTop: 10,
    alignSelf: 'center',
    maxWidth: '94%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(9, 30, 24, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.18)',
  },
  messageText: {
    color: '#F7E9C0',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  qiblaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dateCard: {
    borderRadius: 26,
    backgroundColor: '#0C2019',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.24)',
    padding: 18,
  },
  dateCardTitle: {
    color: '#F6E7BB',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.serif,
    fontWeight: '600',
  },
  dateCardButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(244, 200, 107, 0.16)',
  },
  dateCardButtonText: {
    color: '#F7E9C0',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});
