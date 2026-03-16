import { CameraView } from 'expo-camera';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrayerCornerScene } from '@/features/christian-prayer/components/scenes/prayer-corner-scene';
import {
  ChristianPrayerPalette,
  type ArPlacementState,
  type ChristianArSceneStyle,
} from '@/features/christian-prayer/constants';

interface ChristianArViewportProps {
  placementState: ArPlacementState;
  sceneStyle: ChristianArSceneStyle;
  cameraGranted: boolean;
  floatingPrompts?: string[];
}

export function ChristianArViewport({
  placementState,
  sceneStyle,
  cameraGranted,
  floatingPrompts,
}: ChristianArViewportProps) {
  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      ) : (
        <View style={styles.cameraFallback} />
      )}

      <View style={styles.mask} />
      <PrayerCornerScene floatingPrompts={floatingPrompts} sceneStyle={sceneStyle}>
        <View style={styles.guidanceWrap}>
          <View style={styles.guidanceCard}>
            <ThemedText style={styles.status}>{placementState.status}</ThemedText>
            <ThemedText style={styles.guidance}>{placementState.guidance}</ThemedText>
          </View>
        </View>
      </PrayerCornerScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 360,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#090605',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#251B17',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ChristianPrayerPalette.cameraMask,
  },
  guidanceWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  guidanceCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(20, 14, 12, 0.88)',
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    gap: 4,
  },
  status: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  guidance: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
