import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useARSession } from '@/hooks/use-ar-session';
import { useChristianSceneExperience } from '@/hooks/use-christian-scene-experience';
import { CHRISTIAN_PRAYER_THEME as T } from '@/constants/christian-prayer/theme';
import { SURFACE_DETECTION_TIMEOUT_MS } from '@/constants/christian-prayer/scene-config';

export default function ChristianARScanScreen() {
  const router = useRouter();
  const { startExperience, onCameraReady: notifyCameraReady, onCameraError } = useChristianSceneExperience();

  const { sessionState, startSession, onCameraReady, confirmSurface, onCameraError: sessionError } =
    useARSession(() => {
      // Surface detected - navigate to placement
      router.push('/tradition/christian-prayer/ar-placement');
    });

  useEffect(() => {
    startSession();
    startExperience('nativeARReady');
  }, [startSession, startExperience]);

  const handleCameraReady = () => {
    onCameraReady();
    notifyCameraReady();
    // Auto-confirm surface when camera is ready (using CameraView as surface detection)
    confirmSurface();
  };

  const handleCameraError = () => {
    sessionError(new Error('Camera unavailable'));
    onCameraError();
  };

  const handleImmersiveMode = () => {
    startExperience('immersive3D');
    setTimeout(() => {
      router.push('/tradition/christian-prayer/ar-placement');
    }, SURFACE_DETECTION_TIMEOUT_MS);
  };

  const isScanning = sessionState === 'scanning' || sessionState === 'initializing';
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      {!isWeb && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onCameraReady={handleCameraReady}
          onMountError={handleCameraError}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Scan ring */}
        <View style={[styles.scanRing, isScanning && styles.scanRingActive]}>
          {isScanning && (
            <ActivityIndicator
              size="large"
              color={T.colors.scanRingActive}
              style={styles.spinner}
            />
          )}
        </View>

        <Text style={styles.title}>Finding Surface</Text>
        <Text style={styles.subtitle}>
          {sessionState === 'initializing'
            ? 'Starting camera...'
            : sessionState === 'scanning'
            ? 'Move your device slowly to detect a surface'
            : sessionState === 'detected'
            ? 'Surface found!'
            : 'Point your camera at a flat surface'}
        </Text>

        <TouchableOpacity style={styles.immersiveButton} onPress={handleImmersiveMode}>
          <Text style={styles.immersiveButtonText}>Use Immersive Mode Instead</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: T.spacing.lg,
  },
  scanRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: T.colors.scanRing,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: T.spacing.xl,
  },
  scanRingActive: {
    borderColor: T.colors.scanRingActive,
  },
  spinner: {
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: T.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: T.spacing.xl,
    lineHeight: 22,
  },
  immersiveButton: {
    backgroundColor: T.colors.primary,
    paddingVertical: T.spacing.md,
    paddingHorizontal: T.spacing.xl,
    borderRadius: T.borderRadius.full,
    marginTop: T.spacing.lg,
  },
  immersiveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    right: T.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
