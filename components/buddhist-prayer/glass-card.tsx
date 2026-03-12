import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.lg,
    padding: BuddhistPrayerSpacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
});
