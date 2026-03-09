import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
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
  isSessionPassed?: boolean;
  onSetNotification: (minutes: number) => void;
  onReschedule: () => void;
  onToggleComplete: () => void;
};

export const PrayerActionSheet = forwardRef<PrayerActionSheetRef, PrayerActionSheetProps>(
  (
    {
      prayerName,
      prayerLabel,
      isCompleted,
      isSessionPassed = false,
      onSetNotification,
      onReschedule,
      onToggleComplete,
    },
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
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {prayerLabel}
            </ThemedText>
          </View>

          {/* Mark Complete/Incomplete Section */}
          <TouchableOpacity
            disabled={isSessionPassed}
            style={[
              styles.optionRow,
              { borderTopColor: 'rgba(244, 200, 107, 0.14)' },
              isSessionPassed && styles.optionRowDisabled,
            ]}
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
                    { borderColor: 'rgba(244, 200, 107, 0.18)' },
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
              disabled={isSessionPassed}
              style={styles.actionButton}
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
            disabled={isSessionPassed}
            style={[
              styles.optionRow,
              { borderTopColor: 'rgba(244, 200, 107, 0.14)' },
              isSessionPassed && styles.optionRowDisabled,
            ]}
            onPress={() => {
              onReschedule();
              bottomSheetRef.current?.close();
            }}
          >
            <IconSymbol name="timer" size={22} color={theme.primary} />
            <ThemedText style={styles.optionText}>Reschedule Prayer</ThemedText>
            <IconSymbol name="chevron.right" size={18} color={theme.icon} />
          </TouchableOpacity>

          {isSessionPassed ? (
            <ThemedText style={styles.lockedHint}>
              This prayer session has already passed and can no longer be changed.
            </ThemedText>
          ) : null}

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

PrayerActionSheet.displayName = 'PrayerActionSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#0D2019',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.16)',
  },
  handle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#0D2019',
  },
  handleIndicator: {
    backgroundColor: 'rgba(247, 233, 192, 0.52)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#0D2019',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    fontFamily: Fonts.serif,
    color: '#F6E7BB',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#F8F0DE',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(245, 238, 218, 0.64)',
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
    backgroundColor: 'rgba(244, 200, 107, 0.18)',
    borderColor: 'rgba(244, 200, 107, 0.52)',
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F7EFD9',
  },
  reminderTextActive: {
    color: '#F8E7B4',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: 'rgba(244, 200, 107, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.24)',
  },
  actionButtonText: {
    color: '#F7E9C0',
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
    color: '#F8F0DE',
  },
  optionRowDisabled: {
    opacity: 0.45,
  },
  lockedHint: {
    fontSize: 12,
    color: 'rgba(245, 238, 218, 0.58)',
    marginTop: 10,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7E9C0',
  },
});
