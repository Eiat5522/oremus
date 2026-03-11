import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
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

const HEIGHT: Record<NonNullable<GoldButtonProps['size']>, number> = {
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
  const height = HEIGHT[size];
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.wrapper, { opacity: disabled ? 0.45 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={['#C89B4B', '#8B6328']} style={[styles.button, { height }]}>
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
