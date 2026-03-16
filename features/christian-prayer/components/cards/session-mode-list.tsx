import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import {
  ChristianPrayerPalette,
  ChristianPrayerSpacing,
  type ChristianModeContent,
  type ChristianSessionMode,
} from '@/features/christian-prayer/constants';

interface SessionModeListProps {
  items: ChristianModeContent[];
  activeMode: ChristianSessionMode | null;
  onSelect: (mode: ChristianSessionMode) => void;
}

export function SessionModeList({ items, activeMode, onSelect }: SessionModeListProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = item.mode === activeMode;
        return (
          <GlassCard
            key={item.mode}
            onPress={() => onSelect(item.mode)}
            style={[styles.card, active ? styles.cardActive : null]}
          >
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
          </GlassCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: ChristianPrayerSpacing.sm,
  },
  card: {
    gap: 6,
  },
  cardActive: {
    borderColor: ChristianPrayerPalette.borderStrong,
    backgroundColor: ChristianPrayerPalette.surfaceStrong,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
