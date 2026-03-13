import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { useQiblaAlignment } from '@/hooks/use-qibla-alignment';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import type { PrayerName } from '@/lib/prayer-times';

const CALIBRATION_STEP_DEGREES = 2;
const AUTO_ADVANCE_DELAY_MS = 900;

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPrayerName(value: string | undefined): value is PrayerName {
  return (
    value === 'fajr' ||
    value === 'dhuhr' ||
    value === 'asr' ||
    value === 'maghrib' ||
    value === 'isha'
  );
}

export default function QiblaScreen() {
  const router = useRouter();
  const hasAutoRequestedCamera = useRef(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoAdvancedRef = useRef(false);
  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();
  const [isRequestingCameraPermission, setIsRequestingCameraPermission] = useState(false);
  const [isTransitioningToPrayer, setIsTransitioningToPrayer] = useState(false);

  const params = useLocalSearchParams<{
    prayerName?: string | string[];
    mode?: string | string[];
  }>();
  const prayerNameParam = Array.isArray(params.prayerName)
    ? params.prayerName[0]
    : params.prayerName;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const mode = modeParam === 'session' ? 'session' : 'finder';
  const prayerName = isPrayerName(prayerNameParam) ? prayerNameParam : 'fajr';
  const prayerLabel = `${toTitleCase(prayerName)} Prayer`;

  const {
    alignmentOffset,
    signedOffset,
    alignmentState,
    manualHeadingOffset,
    recenter,
    nudgeCalibration,
  } = useQiblaAlignment();

  const cameraPermissionStatus = cameraPermission?.status ?? null;
  const canAskCameraPermission = cameraPermission?.canAskAgain ?? true;
  const showLiveCamera = cameraPermissionStatus === 'granted';

  useEffect(() => {
    if (hasAutoRequestedCamera.current) {
      return;
    }

    if (cameraPermissionStatus === null || cameraPermissionStatus === 'undetermined') {
      hasAutoRequestedCamera.current = true;
      setIsRequestingCameraPermission(true);
      requestCameraPermission().finally(() => {
        setIsRequestingCameraPermission(false);
      });
    }
  }, [cameraPermissionStatus, requestCameraPermission]);

  useEffect(() => {
    if (mode !== 'session') {
      setIsTransitioningToPrayer(false);
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      hasAutoAdvancedRef.current = false;
      return;
    }

    if (alignmentState === 'aligned') {
      if (autoAdvanceTimeoutRef.current || hasAutoAdvancedRef.current) {
        return;
      }

      setIsTransitioningToPrayer(true);
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        autoAdvanceTimeoutRef.current = null;
        hasAutoAdvancedRef.current = true;

        router.push({
          pathname: '/tradition/islam-session',
          params: { prayerName },
        });
      }, AUTO_ADVANCE_DELAY_MS);

      return;
    }

    setIsTransitioningToPrayer(false);
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, [alignmentState, mode, prayerName, router]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const handleCameraPermissionRequest = async () => {
    setIsRequestingCameraPermission(true);
    try {
      await requestCameraPermission();
    } finally {
      setIsRequestingCameraPermission(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Qibla',
          headerShown: false,
          gestureEnabled: true,
        }}
      />

      <QiblaCompassPage
        mode={mode}
        showLiveCamera={showLiveCamera}
        cameraPermissionStatus={cameraPermissionStatus}
        canAskCameraPermission={canAskCameraPermission}
        isRequestingCameraPermission={isRequestingCameraPermission}
        onRequestCameraPermission={() => {
          void handleCameraPermissionRequest();
        }}
        onOpenCameraSettings={() => {
          void Linking.openSettings();
        }}
        onClose={() => {
          if (router.canGoBack()) {
            router.back();
          }
        }}
        onRecenterCalibration={() => {
          void recenter();
        }}
        onNudgeCalibrationLeft={() => nudgeCalibration(-CALIBRATION_STEP_DEGREES)}
        onNudgeCalibrationRight={() => nudgeCalibration(CALIBRATION_STEP_DEGREES)}
        prayerLabel={mode === 'session' ? prayerLabel : undefined}
        calibrationOffset={manualHeadingOffset}
        alignmentDelta={alignmentOffset}
        signedOffset={signedOffset ?? 0}
        alignmentState={alignmentState}
        isTransitioningToPrayer={isTransitioningToPrayer}
      />
    </View>
  );
}
