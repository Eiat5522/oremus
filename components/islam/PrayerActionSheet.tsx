import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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
  prayerName?: PrayerName;
  prayerLabel?: string;
  isCompleted: boolean;
  isSessionPassed?: boolean;
  onSetNotification: (minutes: number) => void;
  onReschedule: () => void;
  onToggleComplete: () => void;
  onClose?: () => void;
  /** Navigate to the Islamic Prayer Session screen for this prayer. */
  onBeginSession?: () => void;
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
      onClose,
      onBeginSession,
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

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onClose?.();
        }
      },
      [onClose],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {prayerLabel ?? 'Prayer'}
            </ThemedText>
          </View>

          {/* Mark Complete/Incomplete Section */}
          <TouchableOpacity
            disabled={isSessionPassed}
            style={[
              styles.primaryActionButton,
              isCompleted ? styles.primaryActionButtonDanger : styles.primaryActionButtonSuccess,
              isSessionPassed && styles.primaryActionButtonDisabled,
            ]}
            onPress={() => {
              onToggleComplete();
              bottomSheetRef.current?.close();
            }}
          >
            <View style={styles.primaryActionCopy}>
              <View
                style={[
                  styles.primaryActionIconWrap,
                  isCompleted
                    ? styles.primaryActionIconWrapDanger
                    : styles.primaryActionIconWrapSuccess,
                ]}
              >
                <IconSymbol name={isCompleted ? 'close' : 'checkmark'} size={18} color="#FFF8E8" />
              </View>
              <View style={styles.primaryActionTextWrap}>
                <ThemedText style={styles.primaryActionTitle}>
                  {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </ThemedText>
                <ThemedText style={styles.primaryActionSubtitle}>
                  {isCompleted
                    ? 'Move this prayer back to pending.'
                    : 'Count this prayer as completed.'}
                </ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#FFF2CC" />
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

          {/* Begin Prayer Session */}
          {onBeginSession ? (
            <TouchableOpacity
              style={[styles.optionRow, { borderTopColor: 'rgba(244, 200, 107, 0.14)' }]}
              onPress={() => {
                onBeginSession();
                bottomSheetRef.current?.close();
              }}
            >
              <IconSymbol name="play.fill" size={22} color="#D4AF37" />
              <ThemedText style={[styles.optionText, { color: '#F4E5A0' }]}>
                Begin Prayer Session
              </ThemedText>
              <IconSymbol name="chevron.right" size={18} color={theme.icon} />
            </TouchableOpacity>
          ) : null}

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
  primaryActionButton: {
    minHeight: 74,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  primaryActionButtonSuccess: {
    backgroundColor: 'rgba(32, 88, 58, 0.44)',
    borderColor: 'rgba(104, 211, 145, 0.32)',
  },
  primaryActionButtonDanger: {
    backgroundColor: 'rgba(110, 34, 34, 0.36)',
    borderColor: 'rgba(248, 113, 113, 0.28)',
  },
  primaryActionButtonDisabled: {
    opacity: 0.5,
  },
  primaryActionCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  primaryActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionIconWrapSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.22)',
  },
  primaryActionIconWrapDanger: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
  },
  primaryActionTextWrap: {
    flex: 1,
    gap: 2,
  },
  primaryActionTitle: {
    color: '#FFF5D8',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  primaryActionSubtitle: {
    color: 'rgba(255, 245, 216, 0.72)',
    fontSize: 13,
    lineHeight: 18,
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
