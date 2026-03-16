import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ChristianPrayerPalette.surface,
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    borderRadius: ChristianPrayerRadius.md,
    padding: ChristianPrayerSpacing.md,
    gap: ChristianPrayerSpacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
