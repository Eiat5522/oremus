import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BuddhistPrayerColors } from '@/constants/buddhist-prayer/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenContainer({ children, style }: ScreenContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
});
