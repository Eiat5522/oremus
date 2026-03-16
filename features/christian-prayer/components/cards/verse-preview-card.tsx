import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette, type ChristianVerse } from '@/features/christian-prayer/constants';

interface VersePreviewCardProps {
  verse: ChristianVerse;
  label?: string;
}

export function VersePreviewCard({ verse, label = 'Verse Preview' }: VersePreviewCardProps) {
  return (
    <GlassCard>
      <ThemedText style={styles.eyebrow}>{label}</ThemedText>
      <ThemedText style={styles.body}>&quot;{verse.text}&quot;</ThemedText>
      <ThemedText style={styles.reference}>{verse.reference}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  reference: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
