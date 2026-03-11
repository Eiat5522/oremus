import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { useQiblaAlignment } from '@/hooks/use-qibla-alignment';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';

const CALIBRATION_STEP_DEGREES = 2;

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function QiblaScreen() {
  const router = useRouter();
  const hasAutoRequestedCamera = useRef(false);
  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();
  const [isRequestingCameraPermission, setIsRequestingCameraPermission] = useState(false);

  const { prayerName } = useLocalSearchParams<{ prayerName?: string }>();
  const prayerLabel = prayerName ? `${toTitleCase(prayerName)} Prayer` : 'Maghrib Prayer';

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
        onBeginPrayer={() => {
          router.push({
            pathname: '/tradition/islam-session',
            params: { prayerName: prayerName ?? 'maghrib' },
          });
        }}
        prayerLabel={prayerLabel}
        calibrationOffset={manualHeadingOffset}
        alignmentDelta={alignmentOffset}
        signedOffset={signedOffset ?? 0}
        alignmentState={alignmentState}
      />
    </View>
  );
}
