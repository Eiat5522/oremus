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

interface IconToggleRowProps {
  icon: IconSymbolName;
  label: string;
  value: boolean;
  onToggle: () => void;
}

export function IconToggleRow({ icon, label, value, onToggle }: IconToggleRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={styles.row}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <IconSymbol
        name={icon}
        size={20}
        color={value ? BuddhistPrayerColors.goldPrimary : BuddhistPrayerColors.textSecondary}
      />
      <ThemedText style={[styles.label, value && styles.labelActive]}>{label}</ThemedText>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.knob, value && styles.knobActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
  },
  label: {
    flex: 1,
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 15,
  },
  labelActive: {
    color: BuddhistPrayerColors.textPrimary,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: BuddhistPrayerColors.goldSecondary,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: BuddhistPrayerColors.textMuted,
  },
  knobActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
});
