import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface ScanOverlayProps {
  isDetected: boolean;
  instructionText?: string;
}

export function ScanOverlay({
  isDetected,
  instructionText = 'Move your phone slowly to find a flat surface',
}: ScanOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (isDetected) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isDetected, pulseAnim]);

  const borderColor = isDetected ? BuddhistPrayerColors.goldPrimary : 'rgba(255,255,255,0.4)';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.reticle, { borderColor, opacity: pulseAnim }]}>
        <View style={[styles.corner, styles.topLeft, { borderColor }]} />
        <View style={[styles.corner, styles.topRight, { borderColor }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor }]} />
      </Animated.View>
      <View style={styles.instructionBadge}>
        <ThemedText style={styles.instructionText}>
          {isDetected ? '✓ Surface found' : instructionText}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: BuddhistPrayerSpacing.xl,
  },
  reticle: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 2.5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionBadge: {
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    paddingVertical: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
  },
  instructionText: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
});
