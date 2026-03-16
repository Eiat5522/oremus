import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  CHRISTIAN_SESSION_DURATIONS,
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
  type ChristianSessionDuration,
} from '@/features/christian-prayer/constants';

interface DurationChipGroupProps {
  value: ChristianSessionDuration;
  onChange: (value: ChristianSessionDuration) => void;
}

export function DurationChipGroup({ value, onChange }: DurationChipGroupProps) {
  return (
    <View style={styles.container}>
      {CHRISTIAN_SESSION_DURATIONS.map((duration) => {
        const active = duration === value;

        return (
          <Pressable
            key={duration}
            accessibilityLabel={`${duration} minute duration`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessible
            onPress={() => onChange(duration)}
            style={[styles.chip, active ? styles.chipActive : null]}
          >
            <ThemedText style={[styles.label, active ? styles.labelActive : null]}>
              {duration} min
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ChristianPrayerSpacing.sm,
  },
  chip: {
    minWidth: 76,
    height: 42,
    borderRadius: ChristianPrayerRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ChristianPrayerSpacing.md,
    backgroundColor: ChristianPrayerPalette.surfaceSoft,
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
  },
  chipActive: {
    backgroundColor: ChristianPrayerPalette.goldSoft,
    borderColor: ChristianPrayerPalette.borderStrong,
  },
  label: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  labelActive: {
    color: ChristianPrayerPalette.ivory,
  },
});
