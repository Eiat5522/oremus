import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { GoldButton } from './gold-button';

interface PlacementControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onScaleUp: () => void;
  onScaleDown: () => void;
  onReset: () => void;
  onConfirm: () => void;
}

export function PlacementControls({
  onRotateLeft,
  onRotateRight,
  onScaleUp,
  onScaleDown,
  onReset,
  onConfirm,
}: PlacementControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.controlRow}>
        <ControlButton icon="rotate.left" label="Rotate Left" onPress={onRotateLeft} />
        <ControlButton icon="minus.magnifyingglass" label="Smaller" onPress={onScaleDown} />
        <ControlButton icon="plus.magnifyingglass" label="Larger" onPress={onScaleUp} />
        <ControlButton icon="rotate.right" label="Rotate Right" onPress={onRotateRight} />
      </View>
      <View style={styles.actionRow}>
        <Pressable
          onPress={onReset}
          hitSlop={10}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Reset placement"
        >
          <ThemedText style={styles.resetText}>Reset</ThemedText>
        </Pressable>
        <View style={styles.confirmButton}>
          <GoldButton title="Confirm Placement" onPress={onConfirm} size="md" />
        </View>
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
}: {
  icon: IconSymbolName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconSymbol name={icon} size={22} color={BuddhistPrayerColors.goldPrimary} />
      <ThemedText style={styles.iconLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: BuddhistPrayerSpacing.md,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: BuddhistPrayerSpacing.sm,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 56,
    justifyContent: 'center',
    paddingVertical: BuddhistPrayerSpacing.sm,
    paddingHorizontal: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: BuddhistPrayerColors.goldBorder,
  },
  iconLabel: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.md,
  },
  resetButton: {
    minHeight: 48,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  resetButtonPressed: {
    backgroundColor: BuddhistPrayerColors.overlayLight,
    borderColor: BuddhistPrayerColors.goldBorder,
  },
  resetText: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
  },
});
