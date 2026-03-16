import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface ReflectionPromptCardProps {
  prompt: string;
}

export function ReflectionPromptCard({ prompt }: ReflectionPromptCardProps) {
  return (
    <GlassCard>
      <ThemedText style={styles.label}>Reflection Prompt</ThemedText>
      <ThemedText style={styles.prompt}>{prompt}</ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  label: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  prompt: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 16,
    lineHeight: 26,
  },
});
