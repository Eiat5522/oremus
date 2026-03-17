import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ChristianPrayerPalette,
  ChristianPrayerSpacing,
  type ChristianGuidedPrayerPhase,
} from '@/features/christian-prayer/constants';

interface PrayerStepperProps {
  phases: ChristianGuidedPrayerPhase[];
  currentPhase: ChristianGuidedPrayerPhase;
}

export function PrayerStepper({ phases, currentPhase }: PrayerStepperProps) {
  return (
    <View style={styles.container}>
      {phases.map((phase, index) => {
        const active = phase === currentPhase;
        const completed = phases.indexOf(currentPhase) > index;
        return (
          <View key={phase} style={styles.step}>
            <View
              style={[
                styles.dot,
                active ? styles.dotActive : null,
                completed ? styles.dotComplete : null,
              ]}
            />
            <ThemedText style={[styles.label, active ? styles.labelActive : null]}>
              {phase}
            </ThemedText>
          </View>
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
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    backgroundColor: ChristianPrayerPalette.gold,
  },
  dotComplete: {
    backgroundColor: ChristianPrayerPalette.success,
  },
  label: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  labelActive: {
    color: ChristianPrayerPalette.textPrimary,
  },
});
