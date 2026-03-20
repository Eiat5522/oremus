import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { ChristianScene3D } from '@/components/christian-prayer/christian-scene-3d';
import { useChristianSceneExperience } from '@/hooks/use-christian-scene-experience';
import { CHRISTIAN_PRAYER_THEME as T } from '@/constants/christian-prayer/theme';

export default function ChristianARPlacementScreen() {
  const router = useRouter();
  const { mode, isSceneReady, startExperience, onCameraReady, onCameraError } =
    useChristianSceneExperience();

  useEffect(() => {
    startExperience();
  }, [startExperience]);

  const isWeb = Platform.OS === 'web';
  const showCamera = !isWeb && mode === 'nativeARReady';

  return (
    <View style={styles.container}>
      {/* Camera background for nativeARReady mode */}
      {showCamera && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onCameraReady={onCameraReady}
          onMountError={onCameraError}
        />
      )}

      {/* 3D Scene overlay */}
      <View style={[styles.sceneContainer, showCamera && styles.sceneOverlay]}>
        <ChristianScene3D isReady={isSceneReady} />
      </View>

      {/* UI overlay */}
      <View style={styles.uiOverlay} pointerEvents="box-none">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Scene</Text>
        </View>

        {/* Mode indicator */}
        <View style={styles.modeChip}>
          <Text style={styles.modeChipText}>
            {mode === 'nativeARReady' ? '📷 AR Mode' : '✨ Immersive Mode'}
          </Text>
        </View>

        {/* Begin Prayer Button */}
        {isSceneReady && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.prayButton}
              onPress={() => router.push('/tradition/christian-prayer')}
            >
              <Text style={styles.prayButtonText}>Begin Prayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  sceneContainer: {
    flex: 1,
  },
  sceneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: T.spacing.lg,
    paddingBottom: T.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backButton: {
    marginRight: T.spacing.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modeChip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: T.spacing.xs,
    paddingHorizontal: T.spacing.md,
    borderRadius: T.borderRadius.full,
    marginTop: T.spacing.md,
  },
  modeChipText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  footer: {
    padding: T.spacing.xl,
    alignItems: 'center',
  },
  prayButton: {
    backgroundColor: T.colors.primary,
    paddingVertical: T.spacing.md,
    paddingHorizontal: 48,
    borderRadius: T.borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  prayButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
