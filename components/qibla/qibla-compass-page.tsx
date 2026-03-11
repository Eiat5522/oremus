import React from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QiblaAlignmentState } from '@/hooks/use-qibla-alignment';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type CameraViewProps = {
  style?: ViewStyle | ViewStyle[];
  facing?: 'front' | 'back';
};

type CameraViewComponentType = React.ComponentType<CameraViewProps>;

type QiblaCompassPageProps = {
  showLiveCamera: boolean;
  cameraPermissionStatus: string | null;
  canAskCameraPermission: boolean;
  isRequestingCameraPermission: boolean;
  onRequestCameraPermission: () => void;
  onOpenCameraSettings: () => void;
  onClose: () => void;
  onRecenterCalibration: () => void;
  onNudgeCalibrationLeft: () => void;
  onNudgeCalibrationRight: () => void;
  onBeginPrayer: () => void;
  prayerLabel: string;
  calibrationOffset: number;
  alignmentDelta: number | null;
  signedOffset: number;
  alignmentState: QiblaAlignmentState;
};

export function QiblaCompassPage({
  showLiveCamera,
  cameraPermissionStatus,
  canAskCameraPermission,
  isRequestingCameraPermission,
  onRequestCameraPermission,
  onOpenCameraSettings,
  onClose,
  onRecenterCalibration,
  onNudgeCalibrationLeft,
  onNudgeCalibrationRight,
  onBeginPrayer,
  prayerLabel,
  calibrationOffset,
  alignmentDelta,
  signedOffset,
  alignmentState,
}: QiblaCompassPageProps) {
  const insets = useSafeAreaInsets();
  const [safeCameraView, setSafeCameraView] = React.useState<CameraViewComponentType | null>(null);
  const isCameraLoading = showLiveCamera && safeCameraView === null;

  React.useEffect(() => {
    let isMounted = true;

    import('expo-camera')
      .then((cameraModule) => {
        if (!isMounted) return;
        if (typeof cameraModule.CameraView === 'function') {
          setSafeCameraView(cameraModule.CameraView as CameraViewComponentType);
        } else {
          setSafeCameraView(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSafeCameraView(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const arrowAngle = Math.max(-90, Math.min(90, signedOffset));
  const isAligned = alignmentState === 'aligned';
  const isNearAligned = alignmentState === 'nearAligned';

  return (
    <View style={styles.container}>
      {showLiveCamera && safeCameraView ? (
        <View style={StyleSheet.absoluteFill}>
          {React.createElement(safeCameraView, {
            style: StyleSheet.absoluteFillObject,
            facing: 'back',
          })}
        </View>
      ) : isCameraLoading ? (
        <View style={[StyleSheet.absoluteFill, styles.cameraLoadingState]}>
          <ActivityIndicator color="#ffffff" size="small" />
          <ThemedText style={styles.cameraLoadingText}>Loading camera…</ThemedText>
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBackground]} />
      )}

      <View pointerEvents="none" style={styles.sceneScrim} />

      <View pointerEvents="box-none" style={[styles.topControls, { top: insets.top + 12 }]}>
        <Pressable
          onPress={onClose}
          style={styles.iconButton}
          accessibilityLabel="Close Qibla alignment"
          accessibilityRole="button"
        >
          <IconSymbol name="close" size={20} color="#ffffff" />
        </Pressable>

        <Pressable
          onPress={onRecenterCalibration}
          style={styles.iconButton}
          accessibilityLabel="Recenter Qibla heading"
          accessibilityRole="button"
        >
          <IconSymbol name="arrow.clockwise" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <View pointerEvents="none" style={styles.centerZone}>
        <View style={[styles.reticleRingOuter, isAligned && styles.reticleRingAligned]} />
        <View
          style={[styles.reticleRingInner, (isNearAligned || isAligned) && styles.reticleRingNear]}
        />

        <View style={[styles.kaabaBadge, isAligned && styles.kaabaBadgeAligned]}>
          <IconSymbol name="kaaba" size={28} color={isAligned ? '#362200' : '#161616'} />
        </View>

        <View style={styles.guideLine} />

        <Animated.View
          style={[
            styles.directionArrow,
            {
              transform: [{ rotate: `${arrowAngle}deg` }],
              opacity: isAligned ? 0.2 : isNearAligned ? 0.45 : 0.95,
            },
          ]}
        />
      </View>

      <View pointerEvents="none" style={[styles.carpetWrap, isAligned && styles.carpetWrapAligned]}>
        <View style={styles.carpetOuter}>
          <View style={styles.carpetInner} />
        </View>
      </View>

      {!showLiveCamera ? (
        <View style={[styles.permissionNoticeWrap, { top: insets.top + 76 }]}>
          <ThemedText style={styles.permissionNoticeTitle}>Camera unavailable</ThemedText>
          <ThemedText style={styles.permissionNoticeBody}>
            Enable camera access for the immersive Qibla alignment scene.
          </ThemedText>
          {cameraPermissionStatus !== 'granted' && canAskCameraPermission ? (
            <Pressable
              disabled={isRequestingCameraPermission}
              onPress={onRequestCameraPermission}
              style={styles.permissionButton}
            >
              <ThemedText style={styles.permissionButtonText}>
                {isRequestingCameraPermission ? 'Requesting permission...' : 'Enable camera'}
              </ThemedText>
            </Pressable>
          ) : null}
          {cameraPermissionStatus !== 'granted' && !canAskCameraPermission ? (
            <Pressable onPress={onOpenCameraSettings} style={styles.permissionSettingsButton}>
              <ThemedText style={styles.permissionSettingsButtonText}>Open settings</ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.statusCard, { bottom: insets.bottom + 24 }]}>
        <ThemedText style={styles.statusTitle}>
          {isAligned ? 'Qibla Aligned' : isNearAligned ? 'Almost aligned' : 'Facing the Qibla…'}
        </ThemedText>
        <ThemedText style={styles.statusSubtitle}>
          {isAligned
            ? prayerLabel
            : alignmentDelta === null
              ? 'Finding direction…'
              : `Rotate ${Math.round(alignmentDelta)}° to align`}
        </ThemedText>

        {isAligned ? (
          <Pressable
            onPress={onBeginPrayer}
            style={styles.beginButton}
            accessibilityRole="button"
            accessibilityLabel={`Begin ${prayerLabel}`}
          >
            <ThemedText style={styles.beginButtonText}>Begin Prayer</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.calibrationRow}>
            <Pressable onPress={onNudgeCalibrationLeft} style={styles.arrowButton}>
              <IconSymbol name="chevron.left" size={20} color="#ffffff" />
            </Pressable>
            <ThemedText
              style={styles.calibrationText}
            >{`Offset ${Math.round(calibrationOffset)}°`}</ThemedText>
            <Pressable onPress={onNudgeCalibrationRight} style={styles.arrowButton}>
              <IconSymbol name="chevron.right" size={20} color="#ffffff" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080e15' },
  fallbackBackground: { backgroundColor: '#070f18' },
  cameraLoadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#070f18',
  },
  cameraLoadingText: { color: '#f8fafc', fontSize: 14 },
  sceneScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  topControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 110,
  },
  reticleRingOuter: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  reticleRingInner: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  reticleRingNear: {
    borderColor: 'rgba(255,221,143,0.88)',
  },
  reticleRingAligned: {
    borderColor: 'rgba(255,223,120,0.96)',
    shadowColor: '#F7C95F',
    shadowOpacity: 0.56,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  kaabaBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#fff4ca',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  kaabaBadgeAligned: {
    backgroundColor: '#ffe7a8',
    transform: [{ scale: 1.04 }],
  },
  guideLine: {
    position: 'absolute',
    top: '58%',
    height: 180,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
  },
  directionArrow: {
    marginTop: 220,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.96)',
  },
  carpetWrap: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: 150,
    alignItems: 'center',
    transform: [{ perspective: 280 }, { rotateX: '56deg' }],
  },
  carpetWrapAligned: {
    opacity: 0.95,
  },
  carpetOuter: {
    width: '100%',
    height: 126,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,239,197,0.92)',
    backgroundColor: 'rgba(12,12,14,0.84)',
    padding: 10,
  },
  carpetInner: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(237,188,84,0.85)',
    backgroundColor: 'rgba(8,8,10,0.88)',
  },
  permissionNoticeWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 14,
    gap: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  permissionNoticeTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  permissionNoticeBody: { color: 'rgba(255,255,255,0.84)', fontSize: 13, lineHeight: 18 },
  permissionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  permissionButtonText: { color: '#111827', fontSize: 12, fontWeight: '700' },
  permissionSettingsButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  permissionSettingsButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statusCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(8,16,24,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,224,168,0.35)',
    gap: 10,
  },
  statusTitle: {
    color: '#fff5d6',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  statusSubtitle: {
    color: 'rgba(255,240,204,0.84)',
    textAlign: 'center',
    fontSize: 14,
  },
  beginButton: {
    marginTop: 2,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(247,203,103,0.66)',
    backgroundColor: 'rgba(212,175,55,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButtonText: {
    color: '#fff0c0',
    fontSize: 16,
    fontWeight: '700',
  },
  calibrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  calibrationText: {
    color: 'rgba(255,240,206,0.86)',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
