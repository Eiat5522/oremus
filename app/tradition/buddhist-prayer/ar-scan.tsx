import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { GoldButton, SacredHeader, ScanOverlay } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useAltarExperience } from '@/hooks/use-altar-experience';

export default function ARScanScreen() {
  const router = useRouter();
  const { scanStatus, isSurfaceDetected, beginScan, confirmPlacement } = useAltarExperience();

  useEffect(() => {
    beginScan();
  }, [beginScan]);

  useEffect(() => {
    if (scanStatus === 'placed') {
      router.push('/tradition/buddhist-prayer/ar-placement');
    }
  }, [scanStatus, router]);

  const handlePlaceAltar = () => {
    confirmPlacement();
    router.push('/tradition/buddhist-prayer/ar-placement');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Find a Surface" showBackButton onBack={() => router.back()} />

      {/* Subtle dot grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {Array.from({ length: 8 }).map((_, colIdx) => (
              <View key={colIdx} style={styles.gridDot} />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <ScanOverlay
          isDetected={isSurfaceDetected}
          instructionText={
            isSurfaceDetected
              ? 'Surface detected! Tap to place altar.'
              : 'Move your phone slowly to find a flat surface'
          }
        />

        <ThemedText style={[styles.statusText, isSurfaceDetected && styles.statusDetected]}>
          {isSurfaceDetected ? 'Surface Detected!' : 'Scanning…'}
        </ThemedText>

        {isSurfaceDetected ? (
          <View style={styles.actionArea}>
            <GoldButton title="Place Altar Here" onPress={handlePlaceAltar} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    gap: 28,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingTop: 120,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: BuddhistPrayerSpacing.lg,
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  statusText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusDetected: {
    color: BuddhistPrayerColors.goldPrimary,
  },
  actionArea: {
    width: '100%',
  },
});
