import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { MeritOption } from '@/constants/buddhist-prayer/types';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface MeritOptionCardProps {
  option: MeritOption;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function MeritOptionCard({
  label,
  description,
  isSelected,
  onSelect,
}: MeritOptionCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      style={[styles.card, isSelected && styles.selected]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        <View style={styles.textGroup}>
          <ThemedText style={[styles.label, isSelected && styles.labelSelected]}>
            {label}
          </ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BuddhistPrayerRadius.lg,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    backgroundColor: BuddhistPrayerColors.card,
    padding: BuddhistPrayerSpacing.md,
  },
  selected: {
    borderColor: BuddhistPrayerColors.goldPrimary,
    backgroundColor: 'rgba(224,185,110,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.md,
  },
  textGroup: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  labelSelected: {
    color: BuddhistPrayerColors.goldPrimary,
  },
  description: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: BuddhistPrayerRadius.full,
    borderWidth: 1.5,
    borderColor: BuddhistPrayerColors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: BuddhistPrayerColors.goldPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: BuddhistPrayerColors.goldPrimary,
  },
});
