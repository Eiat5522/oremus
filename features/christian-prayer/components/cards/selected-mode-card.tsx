import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import {
  ChristianPrayerPalette,
  type ChristianModeContent,
} from '@/features/christian-prayer/constants';

interface SelectedModeCardProps {
  content: ChristianModeContent;
}

export function SelectedModeCard({ content }: SelectedModeCardProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.eyebrow}>Selected Journey</ThemedText>
      <ThemedText style={styles.title}>{content.title}</ThemedText>
      <ThemedText style={styles.subtitle}>{content.description}</ThemedText>
      <ThemedText style={styles.prompt}>{content.setupPrompt}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  eyebrow: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  prompt: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
