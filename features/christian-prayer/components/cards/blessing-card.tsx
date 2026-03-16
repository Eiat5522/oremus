import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface BlessingCardProps {
  text: string;
}

export function BlessingCard({ text }: BlessingCardProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.label}>Blessing</ThemedText>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(61, 43, 31, 0.95)',
  },
  label: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  text: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 20,
    lineHeight: 30,
  },
});
