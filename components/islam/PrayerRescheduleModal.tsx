import React, { useEffect, useState, useMemo } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PrayerName } from '@/lib/prayer-times';

const REMINDER_OPTIONS = [5, 10, 15, 20, 25, 30];

type PrayerRescheduleModalProps = {
  visible: boolean;
  prayerName: PrayerName;
  prayerLabel: string;
  originalTime: Date;
  nextPrayerTime: Date | null;
  onClose: () => void;
  onSave: (newTime: Date, withReminder: boolean, reminderMinutes: number) => void;
};

export function PrayerRescheduleModal({
  visible,
  prayerName,
  prayerLabel,
  originalTime,
  nextPrayerTime,
  onClose,
  onSave,
}: PrayerRescheduleModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    const time = new Date(originalTime);
    time.setMinutes(time.getMinutes() + 15); // Default to 15 min after original
    return time;
  });
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [withReminder, setWithReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens or originalTime changes
  useEffect(() => {
    if (visible) {
      const time = new Date(originalTime);
      time.setMinutes(time.getMinutes() + 15);
      setSelectedTime(time);
      setWithReminder(true);
      setReminderMinutes(15);
      setError(null);
      setShowTimePicker(Platform.OS === 'ios');
    }
  }, [visible, originalTime]);

  // Validate that selected time is before next prayer's original time
  const isValidTime = useMemo(() => {
    if (!nextPrayerTime) return true;
    return selectedTime.getTime() < nextPrayerTime.getTime();
  }, [selectedTime, nextPrayerTime]);

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
      setError(null);
    }
  };

  const handleSave = () => {
    if (!isValidTime) {
      setError(
        `Time must be before the next prayer starts at ${nextPrayerTime?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
      );
      return;
    }
    onSave(selectedTime, withReminder, reminderMinutes);
    onClose();
  };

  const showAndroidTimePicker = () => {
    setShowTimePicker(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              Reschedule {prayerLabel}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.label}>Select New Time</ThemedText>
            {nextPrayerTime && (
              <ThemedText style={styles.subLabel}>
                Must be before next prayer at{' '}
                {nextPrayerTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </ThemedText>
            )}

            {Platform.OS === 'ios' ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor={theme.text}
                />
              </View>
            ) : (
              <TouchableOpacity style={styles.timeButton} onPress={showAndroidTimePicker}>
                <IconSymbol name="timer" size={20} color={theme.primary} />
                <ThemedText style={styles.timeButtonText}>
                  {selectedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </ThemedText>
                <IconSymbol name="chevron.right" size={18} color={theme.icon} />
              </TouchableOpacity>
            )}

            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {error && (
              <View style={styles.errorContainer}>
                <IconSymbol name="info.circle" size={16} color="#ef4444" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            {/* Reminder Toggle */}
            <View style={styles.reminderSection}>
              <TouchableOpacity
                style={styles.reminderToggle}
                onPress={() => setWithReminder(!withReminder)}
              >
                <View style={[styles.checkbox, withReminder && styles.checkboxActive]}>
                  {withReminder && <IconSymbol name="checkmark" size={14} color="#ffffff" />}
                </View>
                <ThemedText style={styles.reminderLabel}>Set reminder</ThemedText>
              </TouchableOpacity>

              {withReminder && (
                <View style={styles.reminderOptions}>
                  {REMINDER_OPTIONS.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.reminderButton,
                        reminderMinutes === minutes && styles.reminderButtonActive,
                        { borderColor: 'rgba(244, 200, 107, 0.18)' },
                      ]}
                      onPress={() => setReminderMinutes(minutes)}
                    >
                      <ThemedText
                        style={[
                          styles.reminderText,
                          reminderMinutes === minutes && styles.reminderTextActive,
                        ]}
                      >
                        {minutes}m
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0D2019',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.16)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    fontFamily: Fonts.serif,
    color: '#F6E7BB',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8F0DE',
  },
  subLabel: {
    fontSize: 13,
    color: 'rgba(245, 238, 218, 0.64)',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    borderColor: 'rgba(244, 200, 107, 0.18)',
    backgroundColor: 'rgba(244, 200, 107, 0.08)',
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
    color: '#F8F0DE',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(125, 37, 37, 0.24)',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
  },
  reminderSection: {
    marginTop: 8,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(245, 238, 218, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: 'rgba(244, 200, 107, 0.88)',
    borderColor: 'rgba(244, 200, 107, 0.88)',
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F8F0DE',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 34,
  },
  reminderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: 'rgba(244, 200, 107, 0.18)',
    borderColor: 'rgba(244, 200, 107, 0.5)',
  },
  reminderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F8F0DE',
  },
  reminderTextActive: {
    color: '#F8E7B4',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8F0DE',
  },
  saveButton: {
    backgroundColor: 'rgba(244, 200, 107, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.32)',
  },
  saveButtonText: {
    color: '#F7E9C0',
    fontSize: 16,
    fontWeight: '600',
  },
});
