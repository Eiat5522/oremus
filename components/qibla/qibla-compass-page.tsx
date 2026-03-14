import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
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
  mode: 'finder' | 'session';
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
  prayerLabel?: string;
  calibrationOffset: number;
  alignmentDelta: number | null;
  signedOffset: number;
  alignmentState: QiblaAlignmentState;
  isTransitioningToPrayer: boolean;
};

const MAX_ANCHOR_SWEEP_DEGREES = 70;
const MAX_FOCUS_FEEDBACK_DEGREES = 24;

function getTurnDirectionLabel(offset: number) {
  if (offset > 1) return 'right';
  if (offset < -1) return 'left';
  return 'center';
}

export function QiblaCompassPage({
  mode,
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
  prayerLabel,
  calibrationOffset,
  alignmentDelta,
  signedOffset,
  alignmentState,
  isTransitioningToPrayer,
}: QiblaCompassPageProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cameraViewRef = React.useRef<CameraViewComponentType | null>(null);
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const isCameraLoading = showLiveCamera && !isCameraReady;

  React.useEffect(() => {
    let isMounted = true;

    import('expo-camera')
      .then((cameraModule) => {
        if (!isMounted) return;
        if (typeof cameraModule.CameraView === 'function') {
          cameraViewRef.current = cameraModule.CameraView as CameraViewComponentType;
          setIsCameraReady(true);
        } else {
          cameraViewRef.current = null;
          setIsCameraReady(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          cameraViewRef.current = null;
          setIsCameraReady(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isAligned = alignmentState === 'aligned';
  const isNearAligned = alignmentState === 'nearAligned';
  const SafeCameraView = cameraViewRef.current;
  const anchorTravel = Math.min(width * 0.34, 150);
  const clampedSignedOffset = Math.max(
    -MAX_ANCHOR_SWEEP_DEGREES,
    Math.min(MAX_ANCHOR_SWEEP_DEGREES, signedOffset),
  );
  const kaabaTranslateX = (clampedSignedOffset / MAX_ANCHOR_SWEEP_DEGREES) * anchorTravel;
  const focusProgress =
    alignmentDelta === null
      ? 0
      : 1 - Math.min(alignmentDelta, MAX_FOCUS_FEEDBACK_DEGREES) / MAX_FOCUS_FEEDBACK_DEGREES;
  const focusScale = 0.88 + focusProgress * 0.3;
  const focusGlowOpacity = 0.16 + focusProgress * 0.64;
  const targetScale = 0.94 + focusProgress * 0.12 + (isAligned ? 0.04 : 0);
  const targetGlowOpacity = 0.1 + focusProgress * 0.48;
  const beamWidth = Math.max(Math.abs(kaabaTranslateX) - 38, 0);
  const beamTranslateX = kaabaTranslateX / 2;
  const turnDirection = getTurnDirectionLabel(signedOffset);
  const isSessionMode = mode === 'session';

  const statusTitle = isSessionMode
    ? isTransitioningToPrayer
      ? 'Aligned'
      : isAligned
        ? 'Qibla Aligned'
        : isNearAligned
          ? 'Almost aligned'
          : 'Facing the Qibla...'
    : isAligned
      ? 'Qibla aligned'
      : isNearAligned
        ? 'Almost aligned'
        : 'Qibla Finder';

  const statusSubtitle = isSessionMode
    ? isTransitioningToPrayer
      ? `Hold steady. Opening ${prayerLabel ?? 'Prayer Session'}...`
      : isAligned
        ? `${prayerLabel ?? 'Prayer Session'} is ready`
        : alignmentDelta === null
          ? 'Finding direction...'
          : turnDirection === 'center'
            ? `Move the Kaaba into the focus ring. ${Math.round(alignmentDelta)}° remaining`
            : `Turn ${turnDirection}. ${Math.round(alignmentDelta)}° remaining`
    : alignmentDelta === null
      ? 'Align to the Qibla. We are finding your direction...'
      : isAligned
        ? 'You are facing the Qibla.'
        : turnDirection === 'center'
          ? `Align to the Qibla. ${Math.round(alignmentDelta)}° remaining`
          : `Turn ${turnDirection}. ${Math.round(alignmentDelta)}° remaining`;

  return (
    <View style={styles.container}>
      {showLiveCamera && SafeCameraView ? (
        <View style={StyleSheet.absoluteFill}>
          {React.createElement(SafeCameraView, {
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
        <View
          style={[
            styles.focusGlow,
            {
              opacity: focusGlowOpacity,
              transform: [{ scale: focusScale }],
            },
          ]}
        />
        <View
          style={[
            styles.reticleRingOuter,
            (isNearAligned || isAligned) && styles.reticleRingNear,
            isAligned && styles.reticleRingAligned,
            {
              transform: [{ scale: focusScale }],
            },
          ]}
        />
        <View
          style={[
            styles.reticleRingInner,
            (isNearAligned || isAligned) && styles.reticleRingNear,
            {
              transform: [{ scale: 0.96 + focusProgress * 0.14 }],
            },
          ]}
        />
        <View
          style={[
            styles.focusCore,
            {
              opacity: 0.22 + focusProgress * 0.52,
              transform: [{ scale: 0.9 + focusProgress * 0.16 }],
            },
          ]}
        />

        {beamWidth > 0 ? (
          <View
            style={[
              styles.bearingBeam,
              {
                width: beamWidth,
                opacity: 0.18 + focusProgress * 0.34,
                transform: [{ translateX: beamTranslateX }],
              },
            ]}
          />
        ) : null}

        <View style={styles.kaabaAnchorWrap}>
          <View
            style={[
              styles.kaabaAnchor,
              {
                transform: [{ translateX: kaabaTranslateX }, { scale: targetScale }],
              },
            ]}
          >
            <View
              style={[
                styles.kaabaGlow,
                {
                  opacity: targetGlowOpacity,
                  transform: [{ scale: 0.94 + focusProgress * 0.34 }],
                },
              ]}
            />

            <View style={[styles.kaabaBadge, isAligned && styles.kaabaBadgeAligned]}>
              <IconSymbol name="kaaba" size={28} color={isAligned ? '#362200' : '#161616'} />
            </View>
          </View>
        </View>

        <View style={styles.guideLine} />
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
        <ThemedText style={styles.statusTitle}>{statusTitle}</ThemedText>
        <ThemedText style={styles.statusSubtitle}>{statusSubtitle}</ThemedText>

        {isSessionMode && (isAligned || isTransitioningToPrayer) ? (
          <View style={styles.autoAdvanceWrap}>
            <View style={styles.autoAdvanceTrack}>
              <View
                style={[
                  styles.autoAdvanceFill,
                  isTransitioningToPrayer && styles.autoAdvanceFillActive,
                ]}
              />
            </View>
            <ThemedText style={styles.autoAdvanceText}>
              {isTransitioningToPrayer
                ? 'Opening prayer session...'
                : 'Auto-opening prayer session...'}
            </ThemedText>
          </View>
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
  focusGlow: {
    position: 'absolute',
    width: 214,
    height: 214,
    borderRadius: 107,
    backgroundColor: 'rgba(247, 201, 95, 0.24)',
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
    boxShadow: '0 0 24px rgba(247, 201, 95, 0.56)',
  },
  focusCore: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,234,184,0.46)',
  },
  bearingBeam: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,232,183,0.82)',
  },
  kaabaAnchorWrap: {
    position: 'absolute',
    width: 320,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaAnchor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaGlow: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,217,125,0.34)',
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
  autoAdvanceWrap: {
    marginTop: 2,
    gap: 8,
    alignItems: 'center',
  },
  autoAdvanceTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(247,203,103,0.28)',
  },
  autoAdvanceFill: {
    height: '100%',
    width: '72%',
    borderRadius: 999,
    backgroundColor: 'rgba(212,175,55,0.36)',
  },
  autoAdvanceFillActive: {
    width: '100%',
    backgroundColor: 'rgba(247,203,103,0.78)',
  },
  autoAdvanceText: {
    color: '#fff0c0',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
