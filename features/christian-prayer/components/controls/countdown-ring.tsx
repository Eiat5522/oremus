import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface CountdownRingProps {
  totalSeconds: number;
  remainingSeconds: number;
}

export function CountdownRing({ totalSeconds, remainingSeconds }: CountdownRingProps) {
  const size = 148;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const displaySeconds = Math.max(0, remainingSeconds);
  const progress = Math.max(0, Math.min(1, totalSeconds <= 0 ? 0 : displaySeconds / totalSeconds));
  const offset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={ChristianPrayerPalette.gold}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <ThemedText style={styles.value}>{displaySeconds}</ThemedText>
        <ThemedText style={styles.label}>seconds</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  value: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 34,
    fontWeight: '700',
  },
  label: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
