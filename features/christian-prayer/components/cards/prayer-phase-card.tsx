import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette, type ChristianGuidedPrayerPhase } from '@/features/christian-prayer/constants';

interface PrayerPhaseCardProps {
  phase: ChristianGuidedPrayerPhase;
  prompt: string;
}

export function PrayerPhaseCard({ phase, prompt }: PrayerPhaseCardProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.phase}>{phase}</ThemedText>
      <ThemedText style={styles.prompt}>{prompt}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  phase: {
    color: ChristianPrayerPalette.gold,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  prompt: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 18,
    lineHeight: 28,
  },
});
