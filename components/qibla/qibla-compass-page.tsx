import { CameraView } from 'expo-camera';
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  calibrationOffset: number;
  alignmentDelta: number | null;
  isAligned: boolean;
  needleTransform: {
    transform: {
      rotate: Animated.AnimatedInterpolation<string | number>;
    }[];
  };
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
  calibrationOffset,
  alignmentDelta,
  isAligned,
  needleTransform,
}: QiblaCompassPageProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {showLiveCamera ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBackground]} />
      )}

      <View style={[StyleSheet.absoluteFill, styles.sceneScrim]} />

      <View style={[styles.topControls, { top: insets.top + 12 }]}>
        <Pressable onPress={onClose} style={styles.iconButton}>
          <IconSymbol name="close" size={20} color="#ffffff" />
        </Pressable>

        <Pressable onPress={onRecenterCalibration} style={styles.iconButton}>
          <IconSymbol name="arrow.clockwise" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <View style={styles.centerZone}>
        <Animated.View style={[styles.reticleWrap, needleTransform]}>
          <View style={styles.reticleRingOuter} />
          <View style={styles.reticleRingInner} />
          <View style={styles.kaabaBadge}>
            <IconSymbol name="kaaba" size={22} color="#161616" />
          </View>
        </Animated.View>

        <View style={styles.dashedGuide} />
        <View style={styles.directionArrow} />
      </View>

      {!showLiveCamera ? (
        <View style={styles.permissionNoticeWrap}>
          <ThemedText style={styles.permissionNoticeTitle}>Camera unavailable</ThemedText>
          <ThemedText style={styles.permissionNoticeBody}>
            Enable camera access for live Qibla view.
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

      <View style={[styles.bottomControls, { bottom: Math.max(insets.bottom + 18, 30) }]}>
        <Pressable onPress={onNudgeCalibrationLeft} style={styles.arrowButton}>
          <IconSymbol name="chevron.left" size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.alignmentPill}>
          <ThemedText style={styles.alignmentPrimary}>
            {isAligned
              ? 'Aligned'
              : alignmentDelta === null
                ? 'Aligning...'
                : `${Math.round(alignmentDelta)}°`}
          </ThemedText>
          <ThemedText
            style={styles.alignmentSecondary}
          >{`Offset ${Math.round(calibrationOffset)}°`}</ThemedText>
        </View>

        <Pressable onPress={onNudgeCalibrationRight} style={styles.arrowButton}>
          <IconSymbol name="chevron.right" size={24} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  fallbackBackground: {
    backgroundColor: '#0b101f',
  },
  sceneScrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
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
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  reticleWrap: {
    width: 188,
    height: 188,
    borderRadius: 94,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  reticleRingOuter: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  reticleRingInner: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  kaabaBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff3bf',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedGuide: {
    width: 2,
    height: 210,
    borderStyle: 'dashed',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.88)',
  },
  directionArrow: {
    marginTop: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.95)',
  },
  permissionNoticeWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '22%',
    borderRadius: 20,
    padding: 14,
    gap: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    zIndex: 6,
  },
  permissionNoticeTitle: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  permissionNoticeBody: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  permissionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
  },
  permissionButtonText: {
    color: '#111827',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  permissionSettingsButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  permissionSettingsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  bottomControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 6,
    gap: 10,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  alignmentPill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(2,6,23,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  alignmentPrimary: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  alignmentSecondary: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
