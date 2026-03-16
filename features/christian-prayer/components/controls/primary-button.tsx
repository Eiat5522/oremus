import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: ChristianPrayerRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ChristianPrayerPalette.gold,
    paddingHorizontal: ChristianPrayerSpacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ChristianPrayerSpacing.sm,
  },
  label: {
    color: '#2D1D14',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
});
