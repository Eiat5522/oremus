import { StyleSheet, Text, View } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const ProgressPill = ({ progress }: { progress: number }) => (
  <View style={styles.wrap}>
    <View style={[styles.fill, { width: `${progress}%` }]} />
    <Text style={styles.label}>{progress}%</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 26,
    justifyContent: 'center',
    marginBottom: 12,
  },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(224,185,110,0.35)' },
  label: {
    textAlign: 'center',
    color: buddhistPrayerTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
