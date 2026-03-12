import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const GlassCard = ({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: buddhistPrayerTheme.colors.card,
    borderWidth: 1,
    borderColor: buddhistPrayerTheme.colors.border,
    borderRadius: buddhistPrayerTheme.radii.md,
    padding: buddhistPrayerTheme.spacing.md,
    marginBottom: buddhistPrayerTheme.spacing.md,
  },
});
