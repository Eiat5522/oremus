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
          style={styles.resetButton}
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
      style={styles.iconButton}
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
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: BuddhistPrayerSpacing.sm,
    paddingHorizontal: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    minWidth: 70,
  },
  iconLabel: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.md,
  },
  resetButton: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
  },
  resetText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
  },
});
