import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CountdownRing } from '@/features/christian-prayer/components/controls/countdown-ring';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface StillnessOverlayProps {
  title: string;
  body: string;
  totalSeconds: number;
  remainingSeconds: number;
}

export function StillnessOverlay({
  title,
  body,
  totalSeconds,
  remainingSeconds,
}: StillnessOverlayProps) {
  return (
    <View style={styles.container}>
      <CountdownRing totalSeconds={totalSeconds} remainingSeconds={remainingSeconds} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.body}>{body}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 18,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
});
