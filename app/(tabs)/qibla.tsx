import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { useIslamicSessionAnalytics } from '@/hooks/use-islamic-session-analytics';
import { useQiblaAlignment } from '@/hooks/use-qibla-alignment';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import {
  createIslamicPrayerSessionId,
  type IslamicSessionAnalyticsEventType,
  type IslamicSessionAnalyticsPermissionStatus,
  type IslamicSessionAnalyticsTrigger,
} from '@/lib/islamic-session-analytics';
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

function resolvePermissionOutcome(
  status: 'granted' | 'denied',
  canAskAgain: boolean,
): {
  eventType: IslamicSessionAnalyticsEventType;
  permissionStatus: IslamicSessionAnalyticsPermissionStatus;
  dedupeKey: string;
} {
  if (status === 'granted') {
    return {
      eventType: 'camera_permission_granted',
      permissionStatus: 'granted',
      dedupeKey: 'granted',
    };
  }

  return canAskAgain
    ? {
        eventType: 'camera_permission_denied',
        permissionStatus: 'denied',
        dedupeKey: 'denied:true',
      }
    : {
        eventType: 'camera_permission_blocked',
        permissionStatus: 'blocked',
        dedupeKey: 'blocked:false',
      };
}

function resolveScopedPermissionOutcome(
  permissionType: 'camera' | 'location',
  status: 'granted' | 'denied',
  canAskAgain: boolean,
): {
  eventType: IslamicSessionAnalyticsEventType;
  permissionStatus: IslamicSessionAnalyticsPermissionStatus;
  dedupeKey: string;
} {
  const baseOutcome = resolvePermissionOutcome(status, canAskAgain);
  if (permissionType === 'camera') {
    return baseOutcome;
  }

  return {
    eventType: baseOutcome.eventType.replace(
      'camera_permission',
      'location_permission',
    ) as IslamicSessionAnalyticsEventType,
    permissionStatus: baseOutcome.permissionStatus,
    dedupeKey: `${permissionType}:${baseOutcome.dedupeKey}`,
  };
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
    sessionId?: string | string[];
  }>();
  const prayerNameParam = Array.isArray(params.prayerName)
    ? params.prayerName[0]
    : params.prayerName;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const sessionIdParam = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const mode = modeParam === 'session' ? 'session' : 'finder';
  const prayerName = isPrayerName(prayerNameParam) ? prayerNameParam : 'fajr';
  const prayerLabel = `${toTitleCase(prayerName)} Prayer`;
  const sessionIdRef = useRef<string | null>(
    mode === 'session' ? (sessionIdParam ?? createIslamicPrayerSessionId(prayerName)) : null,
  );
  const trackIslamicSessionEvent = useIslamicSessionAnalytics({
    sessionId: sessionIdRef.current,
    prayerName: mode === 'session' ? prayerName : null,
    mode,
    sourceScreen: 'qibla',
  });

  const {
    alignmentOffset,
    signedOffset,
    alignmentState,
    manualHeadingOffset,
    locationError,
    locationPermissionStatus,
    canAskLocationPermission,
    isRequestingLocationPermission,
    requestLocationPermission,
    recenter,
    nudgeCalibration,
  } = useQiblaAlignment();

  const cameraPermissionStatus = cameraPermission?.status ?? null;
  const canAskCameraPermission = cameraPermission?.canAskAgain ?? true;
  const showLiveCamera = cameraPermissionStatus === 'granted';
  const hasTrackedQiblaOpenedRef = useRef(false);
  const lastTrackedCameraPermissionRef = useRef<string | null>(null);
  const lastTrackedLocationPermissionRef = useRef<string | null>(null);
  const hasTrackedLocationPromptRef = useRef(false);
  const hasTrackedAlignmentReachedRef = useRef(false);

  useEffect(() => {
    if (mode !== 'session' || hasTrackedQiblaOpenedRef.current) {
      return;
    }

    hasTrackedQiblaOpenedRef.current = true;
    void trackIslamicSessionEvent('qibla_opened');
  }, [mode, trackIslamicSessionEvent]);

  const openPrayerSession = React.useCallback(
    (trigger: IslamicSessionAnalyticsTrigger) => {
      if (mode !== 'session') {
        return;
      }

      void trackIslamicSessionEvent(
        trigger === 'auto' ? 'auto_start_triggered' : 'manual_start_triggered',
        {
          trigger,
          alignmentOffsetDegrees: alignmentOffset,
        },
      );

      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }

      setIsTransitioningToPrayer(true);
      hasAutoAdvancedRef.current = true;

      router.push({
        pathname: '/tradition/islam-session',
        params: { prayerName, sessionId: sessionIdRef.current ?? undefined },
      });
    },
    [alignmentOffset, mode, prayerName, router, trackIslamicSessionEvent],
  );

  useEffect(() => {
    if (hasAutoRequestedCamera.current) {
      return;
    }

    if (cameraPermissionStatus === null || cameraPermissionStatus === 'undetermined') {
      hasAutoRequestedCamera.current = true;
      if (mode === 'session') {
        void trackIslamicSessionEvent('camera_permission_prompted', {
          permissionType: 'camera',
          permissionStatus: 'prompted',
          canAskAgain: canAskCameraPermission,
        });
      }
      setIsRequestingCameraPermission(true);
      requestCameraPermission().finally(() => {
        setIsRequestingCameraPermission(false);
      });
    }
  }, [
    cameraPermissionStatus,
    canAskCameraPermission,
    mode,
    requestCameraPermission,
    trackIslamicSessionEvent,
  ]);

  useEffect(() => {
    if (mode !== 'session' || hasTrackedLocationPromptRef.current) {
      return;
    }

    hasTrackedLocationPromptRef.current = true;
    void trackIslamicSessionEvent('location_permission_prompted', {
      permissionType: 'location',
      permissionStatus: 'prompted',
      canAskAgain: canAskLocationPermission,
    });
  }, [canAskLocationPermission, mode, trackIslamicSessionEvent]);

  useEffect(() => {
    if (
      mode !== 'session' ||
      cameraPermissionStatus === null ||
      cameraPermissionStatus === 'undetermined'
    ) {
      return;
    }

    const { eventType, permissionStatus, dedupeKey } = resolveScopedPermissionOutcome(
      'camera',
      cameraPermissionStatus,
      canAskCameraPermission,
    );
    if (lastTrackedCameraPermissionRef.current === dedupeKey) {
      return;
    }

    lastTrackedCameraPermissionRef.current = dedupeKey;
    void trackIslamicSessionEvent(eventType, {
      permissionType: 'camera',
      permissionStatus,
      canAskAgain: canAskCameraPermission,
    });
  }, [cameraPermissionStatus, canAskCameraPermission, mode, trackIslamicSessionEvent]);

  useEffect(() => {
    if (mode !== 'session' || !locationPermissionStatus) {
      return;
    }

    const { eventType, permissionStatus, dedupeKey } = resolveScopedPermissionOutcome(
      'location',
      locationPermissionStatus,
      canAskLocationPermission,
    );
    if (lastTrackedLocationPermissionRef.current === dedupeKey) {
      return;
    }

    lastTrackedLocationPermissionRef.current = dedupeKey;
    void trackIslamicSessionEvent(eventType, {
      permissionType: 'location',
      permissionStatus,
      canAskAgain: canAskLocationPermission,
    });
  }, [canAskLocationPermission, locationPermissionStatus, mode, trackIslamicSessionEvent]);

  useEffect(() => {
    if (mode !== 'session') {
      hasTrackedAlignmentReachedRef.current = false;
      return;
    }

    if (alignmentState === 'aligned' && !hasTrackedAlignmentReachedRef.current) {
      hasTrackedAlignmentReachedRef.current = true;
      void trackIslamicSessionEvent('alignment_reached', {
        alignmentOffsetDegrees: alignmentOffset,
      });
      return;
    }

    if (alignmentState !== 'aligned') {
      hasTrackedAlignmentReachedRef.current = false;
    }
  }, [alignmentOffset, alignmentState, mode, trackIslamicSessionEvent]);

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
        openPrayerSession('auto');
      }, AUTO_ADVANCE_DELAY_MS);

      return;
    }

    setIsTransitioningToPrayer(false);
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, [alignmentState, mode, openPrayerSession]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const handleCameraPermissionRequest = async () => {
    if (mode === 'session') {
      void trackIslamicSessionEvent('camera_permission_prompted', {
        permissionType: 'camera',
        permissionStatus: 'prompted',
        canAskAgain: canAskCameraPermission,
      });
    }
    setIsRequestingCameraPermission(true);
    try {
      await requestCameraPermission();
    } finally {
      setIsRequestingCameraPermission(false);
    }
  };

  const showLocationRecoveryNotice = alignmentOffset === null && Boolean(locationError);

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
        showLocationRecoveryNotice={showLocationRecoveryNotice}
        locationError={locationError}
        canAskLocationPermission={canAskLocationPermission}
        isRequestingLocationPermission={isRequestingLocationPermission}
        onRequestCameraPermission={() => {
          void handleCameraPermissionRequest();
        }}
        onRequestLocationPermission={() => {
          if (mode === 'session') {
            void trackIslamicSessionEvent('location_permission_prompted', {
              permissionType: 'location',
              permissionStatus: 'prompted',
              canAskAgain: canAskLocationPermission,
            });
          }
          void requestLocationPermission();
        }}
        onOpenCameraSettings={() => {
          void Linking.openSettings();
        }}
        onOpenLocationSettings={() => {
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
        onStartPrayerNow={() => openPrayerSession('manual')}
      />
    </View>
  );
}
