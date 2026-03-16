import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette, type ChristianSessionSummary } from '@/features/christian-prayer/constants';

interface CompletionSummaryCardProps {
  summary: ChristianSessionSummary;
}

export function CompletionSummaryCard({ summary }: CompletionSummaryCardProps) {
  return (
    <GlassCard>
      <ThemedText style={styles.eyebrow}>Session Complete</ThemedText>
      <ThemedText style={styles.title}>{summary.title}</ThemedText>
      <View style={styles.metricRow}>
        <Metric label="Mode" value={summary.mode} />
        <Metric label="Duration" value={`${summary.timeSpentSeconds}s`} />
      </View>
      <ThemedText style={styles.reference}>{summary.verse.reference}</ThemedText>
      <ThemedText style={styles.verse}>&quot;{summary.verse.text}&quot;</ThemedText>
    </GlassCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  reference: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  verse: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
