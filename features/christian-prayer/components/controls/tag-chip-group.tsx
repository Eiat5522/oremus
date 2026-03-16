import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ChristianPrayerPalette,
  ChristianPrayerRadius,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface TagChipGroupProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function TagChipGroup({ options, selected, onChange }: TagChipGroupProps) {
  return (
    <View style={styles.container}>
      {options.map((tag) => {
        const active = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            accessibilityHint={
              active ? 'Removes this reflection tag.' : 'Adds this reflection tag.'
            }
            accessibilityLabel={tag}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessible
            onPress={() =>
              onChange(active ? selected.filter((item) => item !== tag) : [...selected, tag])
            }
            style={[styles.chip, active ? styles.chipActive : null]}
          >
            <ThemedText style={[styles.label, active ? styles.labelActive : null]}>
              {tag}
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
    borderRadius: ChristianPrayerRadius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  labelActive: {
    color: ChristianPrayerPalette.ivory,
  },
});
