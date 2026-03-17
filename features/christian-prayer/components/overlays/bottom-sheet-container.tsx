import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface BottomSheetContainerProps {
  children: React.ReactNode;
}

export function BottomSheetContainer({ children }: BottomSheetContainerProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    borderTopLeftRadius: ChristianPrayerRadius.lg,
    borderTopRightRadius: ChristianPrayerRadius.lg,
    padding: ChristianPrayerSpacing.lg,
    backgroundColor: 'rgba(28, 19, 15, 0.94)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    gap: ChristianPrayerSpacing.md,
  },
});
