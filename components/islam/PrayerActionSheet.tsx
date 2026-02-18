import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PrayerName } from '@/lib/prayer-times';

const REMINDER_OPTIONS = [5, 10, 15, 20, 25, 30];

export interface PrayerActionSheetRef {
  open: () => void;
  close: () => void;
}

type PrayerActionSheetProps = {
  prayerName: PrayerName;
  prayerLabel: string;
  isCompleted: boolean;
  onSetNotification: (minutes: number) => void;
  onReschedule: () => void;
  onToggleComplete: () => void;
};

export const PrayerActionSheet = forwardRef<PrayerActionSheetRef, PrayerActionSheetProps>(
  (
    { prayerName, prayerLabel, isCompleted, onSetNotification, onReschedule, onToggleComplete },
    ref,
  ) => {
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [selectedReminder, setSelectedReminder] = React.useState(15);

    React.useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.snapToIndex(0);
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const snapPoints = useMemo(() => ['50%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        // Sheet closed
      }
    }, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleStyle={[styles.handle, { backgroundColor: theme.surface }]}
        handleIndicatorStyle={{ backgroundColor: theme.icon }}
      >
        <BottomSheetView style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {prayerLabel}
            </ThemedText>
          </View>

          {/* Set Notification Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Set Notification</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Remind me before prayer time</ThemedText>
            <View style={styles.reminderOptions}>
              {REMINDER_OPTIONS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.reminderButton,
                    selectedReminder === minutes && styles.reminderButtonActive,
                    { borderColor: theme.borderLight },
                  ]}
                  onPress={() => setSelectedReminder(minutes)}
                >
                  <ThemedText
                    style={[
                      styles.reminderText,
                      selectedReminder === minutes && styles.reminderTextActive,
                    ]}
                  >
                    {minutes}m
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                onSetNotification(selectedReminder);
                bottomSheetRef.current?.close();
              }}
            >
              <IconSymbol name="bell.fill" size={18} color="#ffffff" />
              <ThemedText style={styles.actionButtonText}>
                Set {selectedReminder} Minute Reminder
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Reschedule Section */}
          <TouchableOpacity
            style={[styles.optionRow, { borderTopColor: theme.borderLight }]}
            onPress={() => {
              onReschedule();
              bottomSheetRef.current?.close();
            }}
          >
            <IconSymbol name="timer" size={22} color={theme.primary} />
            <ThemedText style={styles.optionText}>Reschedule Prayer</ThemedText>
            <IconSymbol name="chevron.right" size={18} color={theme.icon} />
          </TouchableOpacity>

          {/* Mark Complete/Incomplete Section */}
          <TouchableOpacity
            style={[styles.optionRow, { borderTopColor: theme.borderLight }]}
            onPress={() => {
              onToggleComplete();
              bottomSheetRef.current?.close();
            }}
          >
            <IconSymbol
              name={isCompleted ? 'close' : 'checkmark'}
              size={22}
              color={isCompleted ? '#ef4444' : '#22c55e'}
            />
            <ThemedText style={styles.optionText}>
              {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={18} color={theme.icon} />
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <ThemedText style={[styles.cancelText, { color: theme.primary }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

PrayerActionSheet.displayName = 'PrayerActionSheet';

const styles = StyleSheet.create({
  handle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reminderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: '#1e4e3c',
    borderColor: '#1e4e3c',
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderTextActive: {
    color: '#ffffff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
