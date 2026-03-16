import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { ChristianPrayerPalette, type ChristianVerse } from '@/features/christian-prayer/constants';

interface ChristianSessionHeroProps {
  verse: ChristianVerse;
}

export function ChristianSessionHero({ verse }: ChristianSessionHeroProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.eyebrow}>Christian Prayer Corner</ThemedText>
      <ThemedText style={styles.title}>{verse.title}</ThemedText>
      <ThemedText style={styles.body}>&quot;{verse.text}&quot;</ThemedText>
      <View style={styles.metaRow}>
        <ThemedText style={styles.reference}>{verse.reference}</ThemedText>
        <View style={styles.themeChip}>
          <ThemedText style={styles.themeLabel}>{verse.theme}</ThemedText>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  eyebrow: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reference: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  themeChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: ChristianPrayerPalette.goldSoft,
  },
  themeLabel: {
    color: ChristianPrayerPalette.ivory,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
