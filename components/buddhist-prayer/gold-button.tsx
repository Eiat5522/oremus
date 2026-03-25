import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerGradients,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

const BUTTON_HEIGHTS: Record<NonNullable<GoldButtonProps['size']>, number> = {
  sm: 40,
  md: 52,
  lg: 60,
};

export function GoldButton({
  title,
  onPress,
  disabled,
  size = 'md',
  variant = 'primary',
}: GoldButtonProps) {
  const height = BUTTON_HEIGHTS[size];
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={size === 'sm' ? 8 : undefined}
      style={({ pressed }) => [
        styles.wrapper,
        { opacity: disabled ? 0.45 : 1 },
        pressed && !disabled ? styles.wrapperPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={BuddhistPrayerGradients.button} style={[styles.button, { height }]}>
          <ThemedText style={[styles.label, { fontSize }]}>{title}</ThemedText>
        </LinearGradient>
      ) : (
        <View style={[styles.button, { height }, variant === 'outline' && styles.outline]}>
          <ThemedText
            style={[
              styles.label,
              { fontSize },
              variant === 'outline' && { color: BuddhistPrayerColors.goldPrimary },
              variant === 'ghost' && { color: BuddhistPrayerColors.textSecondary },
            ]}
          >
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BuddhistPrayerRadius.lg,
    overflow: 'hidden',
  },
  wrapperPressed: {
    transform: [{ scale: 0.98 }],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    borderRadius: BuddhistPrayerRadius.lg,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: BuddhistPrayerColors.goldBorder,
    backgroundColor: 'transparent',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
