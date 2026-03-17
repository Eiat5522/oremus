import React from 'react';
import { Pressable, type PressableProps, StyleSheet } from 'react-native';

import {
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface IconCircleButtonProps extends Omit<PressableProps, 'children' | 'onPress' | 'style'> {
  children: React.ReactNode;
  onPress: NonNullable<PressableProps['onPress']>;
}

export function IconCircleButton({
  children,
  onPress,
  disabled = false,
  accessibilityRole,
  accessibilityState,
  ...pressableProps
}: IconCircleButtonProps) {
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    borderRadius: ChristianPrayerRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ChristianPrayerPalette.surfaceSoft,
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    padding: ChristianPrayerSpacing.xs,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
  },
});
