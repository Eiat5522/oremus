import { StyleSheet, Text, View } from 'react-native';

import type { ChantVerse } from '@/src/features/buddhistPrayer/types/buddhistPrayer';
import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const ChantTextBlock = ({
  verse,
  showMeaning,
}: {
  verse: ChantVerse;
  showMeaning: boolean;
}) => (
  <View style={styles.wrap}>
    <Text style={styles.thai}>{verse.thai}</Text>
    <Text style={styles.pali}>{verse.pali}</Text>
    {showMeaning ? <Text style={styles.english}>{verse.english}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 20 },
  thai: {
    color: buddhistPrayerTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 42,
  },
  pali: {
    color: buddhistPrayerTheme.colors.primaryGold,
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  english: {
    color: buddhistPrayerTheme.colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
