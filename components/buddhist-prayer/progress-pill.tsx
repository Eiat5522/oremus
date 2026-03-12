import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface ProgressPillProps {
  current: number;
  total: number;
}

export function ProgressPill({ current, total }: ProgressPillProps) {
  return (
    <View style={styles.pill}>
      <ThemedText style={styles.text}>
        Verse {current} of {total}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.xs,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.12)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
  },
  text: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
