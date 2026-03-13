import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';

interface ChantTextBlockProps {
  thai?: string;
  pali?: string;
  english: string;
  transliteration?: string;
  meaning?: string;
  showMeaning?: boolean;
}

export function ChantTextBlock({
  thai,
  pali,
  english,
  transliteration,
  meaning,
  showMeaning,
}: ChantTextBlockProps) {
  return (
    <View style={styles.container}>
      {thai ? (
        <ThemedText style={styles.thaiText} accessibilityLanguage="th-TH">
          {thai}
        </ThemedText>
      ) : null}
      {pali ? (
        <ThemedText style={styles.paliText} accessibilityLanguage="pi">
          {pali}
        </ThemedText>
      ) : null}
      {transliteration && !thai ? (
        <ThemedText style={styles.transliterationText} accessibilityLanguage="pi-Latn">
          {transliteration}
        </ThemedText>
      ) : null}
      <ThemedText style={styles.englishText} accessibilityLanguage="en-US">
        {english}
      </ThemedText>
      {showMeaning && meaning ? (
        <View style={styles.meaningContainer}>
          <View style={styles.meaningDivider} />
          <ThemedText style={styles.meaningText} accessibilityLanguage="en-US">
            {meaning}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.sm,
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  thaiText: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
  },
  paliText: {
    color: '#F0D8A0',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
  },
  transliterationText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  englishText: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  meaningContainer: {
    marginTop: BuddhistPrayerSpacing.sm,
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.sm,
    width: '100%',
  },
  meaningDivider: {
    width: 40,
    height: 1,
    backgroundColor: BuddhistPrayerColors.goldBorder,
  },
  meaningText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});
