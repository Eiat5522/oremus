import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import {
  BuddhistAltar3D,
  GlassCard,
  PlacementControls,
  SacredHeader,
} from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useAltarExperience } from '@/hooks/use-altar-experience';

export default function ARPlacementScreen() {
  const router = useRouter();
  const [permission] = useCameraPermissions();
  const {
    placementScale,
    placementRotation,
    altarExperienceMode,
    adjustRotation,
    adjustScale,
    resetAltarPlacement,
    confirmPlacement,
  } = useAltarExperience();

  const isNativeAR = altarExperienceMode === 'nativeARReady';
  const cameraGranted = permission?.granted ?? false;

  const handleConfirm = () => {
    confirmPlacement();
    router.push('/tradition/buddhist-prayer/ar-preparation');
  };

  const handleReset = () => {
    resetAltarPlacement();
    router.replace('/tradition/buddhist-prayer/ar-scan');
  };

  return (
    <View style={[styles.container, isNativeAR && styles.containerAR]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Live camera background for native AR anchored placement */}
      {isNativeAR && cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : null}

      <SacredHeader
        title="Place Your Altar"
        subtitle="Adjust to your preference"
        showBackButton
        onBack={() => router.back()}
      />

      <View style={styles.altarArea}>
        <BuddhistAltar3D scale={placementScale} rotation={placementRotation} style={styles.altar} />
      </View>

      <GlassCard style={styles.controlsCard}>
        <ThemedText style={styles.controlsLabel}>Adjust Altar</ThemedText>
        <PlacementControls
          onRotateLeft={() => adjustRotation(-15)}
          onRotateRight={() => adjustRotation(15)}
          onScaleDown={() => adjustScale(-0.1)}
          onScaleUp={() => adjustScale(0.1)}
          onReset={handleReset}
          onConfirm={handleConfirm}
        />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  containerAR: {
    backgroundColor: 'transparent',
  },
  altarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  controlsCard: {
    marginHorizontal: BuddhistPrayerSpacing.md,
    marginBottom: BuddhistPrayerSpacing.xl,
    gap: BuddhistPrayerSpacing.sm,
  },
  controlsLabel: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
