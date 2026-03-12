import { StyleSheet, Text, View } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const SacredHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, marginTop: 8 },
  title: {
    color: buddhistPrayerTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: buddhistPrayerTheme.colors.textSecondary,
    fontSize: 14,
  },
});
