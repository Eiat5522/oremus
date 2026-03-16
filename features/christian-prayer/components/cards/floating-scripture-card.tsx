import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette, type ChristianVerse } from '@/features/christian-prayer/constants';

interface FloatingScriptureCardProps {
  verse: ChristianVerse;
  intro: string;
}

export function FloatingScriptureCard({ verse, intro }: FloatingScriptureCardProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.intro}>{intro}</ThemedText>
      <ThemedText style={styles.verse}>&quot;{verse.text}&quot;</ThemedText>
      <ThemedText style={styles.reference}>{verse.reference}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(49, 34, 26, 0.9)',
    gap: 10,
  },
  intro: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  verse: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 20,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  reference: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
