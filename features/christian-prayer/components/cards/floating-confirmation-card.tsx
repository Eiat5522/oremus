import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface FloatingConfirmationCardProps {
  title: string;
  body: string;
}

export function FloatingConfirmationCard({ title, body }: FloatingConfirmationCardProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.body}>{body}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(40, 27, 21, 0.92)',
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
