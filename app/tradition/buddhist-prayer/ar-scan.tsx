import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

import {
  BuddhistAltar3D,
  GoldButton,
  SacredHeader,
  ScanOverlay,
} from '@/components/buddhist-prayer';
import { ALTAR_EXPERIENCE_OPTIONS } from '@/constants/buddhist-prayer/altar-experience';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useAltarExperience } from '@/hooks/use-altar-experience';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

export default function ARScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const altarExperienceMode = useBuddhistPrayerStore((state) => state.altarExperienceMode);
  const setAltarExperienceMode = useBuddhistPrayerStore((state) => state.setAltarExperienceMode);
  const { isSurfaceDetected, beginScan, resetAltarPlacement } = useAltarExperience();
  const modeOption = ALTAR_EXPERIENCE_OPTIONS[altarExperienceMode];

  useEffect(() => {
    resetAltarPlacement();
  }, [resetAltarPlacement]);

  useEffect(() => {
    if (
      altarExperienceMode === 'nativeARReady' &&
      !permission?.granted &&
      permission?.canAskAgain
    ) {
      void requestPermission();
    }
  }, [altarExperienceMode, permission?.canAskAgain, permission?.granted, requestPermission]);

  useEffect(() => {
    if (altarExperienceMode === 'immersive3D') {
      beginScan();
    }
  }, [altarExperienceMode, beginScan]);

  useEffect(() => {
    if (altarExperienceMode === 'nativeARReady' && permission?.granted) {
      beginScan();
    }
  }, [altarExperienceMode, beginScan, permission?.granted]);

  const handlePlaceAltar = () => {
    router.push('/tradition/buddhist-prayer/ar-placement');
  };

  const handleSwitchToImmersive = () => {
    setAltarExperienceMode('immersive3D');
  };

  const isNativeMode = altarExperienceMode === 'nativeARReady';
  const showPermissionState = isNativeMode && permission?.granted === false;

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
        {showPermissionState ? (
          <View style={styles.permissionCard}>
            <ThemedText style={styles.permissionTitle}>
              Camera access is needed for room scan
            </ThemedText>
            <ThemedText style={styles.permissionText}>
              Native AR ready mode uses the camera-led placement flow. Grant access to keep the room
              scan experience, or switch to immersive 3D if you prefer the fallback scene.
            </ThemedText>
            <View style={styles.permissionActions}>
              <GoldButton title="Allow Camera" onPress={() => requestPermission()} />
              <GoldButton
                title="Use Immersive 3D Instead"
                variant="outline"
                onPress={handleSwitchToImmersive}
              />
            </View>
          </View>
        ) : (
          <>
            {isNativeMode ? (
              <ScanOverlay
                isDetected={isSurfaceDetected}
                instructionText={
                  isSurfaceDetected
                    ? 'Anchor found. Continue to fine-tune your altar placement.'
                    : 'Move your phone slowly so the room scan can find a flat surface'
                }
              />
            ) : (
              <View style={styles.immersiveScene}>
                <BuddhistAltar3D showHalo style={styles.immersiveAltar} />
                <ThemedText style={styles.immersiveCopy}>
                  Entering the immersive fallback scene. We will keep your altar in this sanctuary
                  and let you fine-tune its placement before chanting.
                </ThemedText>
              </View>
            )}

            <ThemedText
              style={[styles.statusText, isSurfaceDetected ? styles.statusDetected : null]}
            >
              {isSurfaceDetected
                ? `${modeOption.title} ready for placement`
                : isNativeMode
                  ? 'Scanning your room…'
                  : 'Preparing immersive sanctuary…'}
            </ThemedText>

            {isSurfaceDetected ? (
              <View style={styles.actionArea}>
                <GoldButton title="Continue to Placement" onPress={handlePlaceAltar} />
              </View>
            ) : null}
          </>
        )}
        <ThemedText style={styles.modeFootnote}>
          {isNativeMode
            ? 'Native AR ready mode prepares the camera-based placement experience for future AR features.'
            : 'Immersive 3D mode skips the camera and keeps the altar experience intentional on unsupported devices.'}
        </ThemedText>
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
  permissionCard: {
    width: '100%',
    gap: BuddhistPrayerSpacing.md,
    padding: BuddhistPrayerSpacing.lg,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
  },
  permissionTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  permissionText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  permissionActions: {
    gap: BuddhistPrayerSpacing.sm,
  },
  immersiveScene: {
    width: '100%',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.md,
  },
  immersiveAltar: {
    width: '100%',
    maxWidth: 340,
  },
  immersiveCopy: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
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
  modeFootnote: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
