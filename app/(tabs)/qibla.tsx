import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { useIslamicSessionAnalytics } from '@/hooks/use-islamic-session-analytics';
import { useQiblaAlignment } from '@/hooks/use-qibla-alignment';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import { createIslamicPrayerSessionId } from '@/lib/islamic-session-analytics';
import type { PrayerName } from '@/lib/prayer-times';

const CALIBRATION_STEP_DEGREES = 2;
const ALIGNMENT_STABILITY_WINDOW_MS = 900;

type SessionStartState = 'idle' | 'stabilizing' | 'starting';

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
  const alignedAtRef = useRef<number | null>(null);
  const latestAlignmentStateRef = useRef<'notAligned' | 'nearAligned' | 'aligned'>('notAligned');
  const latestAlignmentOffsetRef = useRef<number | null>(null);
  const pendingSettingsRefreshRef = useRef<Set<'camera' | 'location'>>(new Set());
  const [sessionStartState, setSessionStartState] = useState<SessionStartState>('idle');
  const [
    cameraPermission,
    requestCameraPermission,
    refreshCameraPermission,
    {
      permissionFlowState: cameraPermissionFlowState,
      permissionSyncSource: cameraPermissionSyncSource,
      isRequestingPermission: isRequestingCameraPermission,
      lastPermissionFailure: lastCameraPermissionFailure,
    },
  ] = useSafeCameraPermissions();

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
    locationPermissionFlowState,
    locationPermissionSyncSource,
    canAskLocationPermission,
    isRequestingLocationPermission,
    lastLocationPermissionFailure,
    requestLocationPermission,
    refreshLocationPermission,
    recenter,
    nudgeCalibration,
  } = useQiblaAlignment();

  const cameraPermissionStatus = cameraPermission?.status ?? null;
  const canAskCameraPermission = cameraPermission?.canAskAgain ?? true;
  const showLiveCamera = cameraPermissionStatus === 'granted';
  const hasTrackedQiblaOpenedRef = useRef(false);
  const lastTrackedCameraPermissionRef = useRef<string | null>(null);
  const lastTrackedLocationPermissionRef = useRef<string | null>(null);
  const lastTrackedCameraFailureRef = useRef<string | null>(null);
  const lastTrackedLocationFailureRef = useRef<string | null>(null);
  const lastTrackedCameraModuleFailureRef = useRef<string | null>(null);
  const hasTrackedLocationPromptRef = useRef(false);
  const hasTrackedAlignmentReachedRef = useRef(false);
  const hasTrackedAlignmentStableRef = useRef(false);

  useEffect(() => {
    latestAlignmentStateRef.current = alignmentState;
    latestAlignmentOffsetRef.current = alignmentOffset;
  }, [alignmentOffset, alignmentState]);

  const trackStructuredFailure = React.useCallback(
    (
      type:
        | 'camera_module_load_failed'
        | 'camera_permission_request_failed'
        | 'location_permission_state_failed'
        | 'session_start_failed',
      details: Record<string, string | number | boolean | null>,
    ) => {
      console.error('[QiblaSessionFlow]', {
        type,
        ...details,
      });

      if (mode !== 'session') {
        return;
      }

      void trackIslamicSessionEvent(type, {
        trigger: type === 'session_start_failed' ? 'system' : null,
        alignmentOffsetDegrees: latestAlignmentOffsetRef.current,
        extra: details,
      });
    },
    [mode, trackIslamicSessionEvent],
  );

  useEffect(() => {
    if (mode !== 'session' || hasTrackedQiblaOpenedRef.current) {
      return;
    }

    hasTrackedQiblaOpenedRef.current = true;
    void trackIslamicSessionEvent('qibla_opened');
  }, [mode, trackIslamicSessionEvent]);

  const openPrayerSession = React.useCallback(
    (trigger: 'auto' | 'manual') => {
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

      setSessionStartState('starting');
      hasAutoAdvancedRef.current = true;

      try {
        router.push({
          pathname: '/tradition/islam-session',
          params: { prayerName, sessionId: sessionIdRef.current ?? undefined },
        });
      } catch (error) {
        hasAutoAdvancedRef.current = false;
        setSessionStartState('idle');
        trackStructuredFailure('session_start_failed', {
          startTrigger: trigger,
          errorMessage:
            error instanceof Error ? error.message : 'Unable to open the prayer session.',
          cameraPermissionFlowState,
          locationPermissionFlowState,
        });
      }
    },
    [
      alignmentOffset,
      cameraPermissionFlowState,
      locationPermissionFlowState,
      mode,
      prayerName,
      router,
      trackIslamicSessionEvent,
      trackStructuredFailure,
    ],
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
          extra: {
            permissionFlowState: cameraPermissionFlowState,
            permissionSyncSource: cameraPermissionSyncSource,
          },
        });
      }
      void requestCameraPermission();
    }
  }, [
    cameraPermissionStatus,
    canAskCameraPermission,
    cameraPermissionFlowState,
    cameraPermissionSyncSource,
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

    const permissionEvent =
      cameraPermissionStatus === 'granted'
        ? 'camera_permission_granted'
        : canAskCameraPermission
          ? 'camera_permission_denied'
          : 'camera_permission_blocked';
    const permissionKey = `${permissionEvent}:${canAskCameraPermission}:${cameraPermissionSyncSource}`;
    if (lastTrackedCameraPermissionRef.current === permissionKey) {
      return;
    }

    lastTrackedCameraPermissionRef.current = permissionKey;
    void trackIslamicSessionEvent(permissionEvent, {
      permissionType: 'camera',
      permissionStatus:
        cameraPermissionStatus === 'granted'
          ? 'granted'
          : canAskCameraPermission
            ? 'denied'
            : 'blocked',
      canAskAgain: canAskCameraPermission,
      extra: {
        permissionFlowState: cameraPermissionFlowState,
        permissionSyncSource: cameraPermissionSyncSource,
      },
    });
  }, [
    cameraPermissionFlowState,
    cameraPermissionStatus,
    cameraPermissionSyncSource,
    canAskCameraPermission,
    mode,
    trackIslamicSessionEvent,
  ]);

  useEffect(() => {
    if (mode !== 'session' || !locationPermissionStatus) {
      return;
    }

    const permissionEvent =
      locationPermissionStatus === 'granted'
        ? 'location_permission_granted'
        : canAskLocationPermission
          ? 'location_permission_denied'
          : 'location_permission_blocked';
    const permissionKey = `${permissionEvent}:${canAskLocationPermission}:${locationPermissionSyncSource}`;
    if (lastTrackedLocationPermissionRef.current === permissionKey) {
      return;
    }

    lastTrackedLocationPermissionRef.current = permissionKey;
    void trackIslamicSessionEvent(permissionEvent, {
      permissionType: 'location',
      permissionStatus:
        locationPermissionStatus === 'granted'
          ? 'granted'
          : canAskLocationPermission
            ? 'denied'
            : 'blocked',
      canAskAgain: canAskLocationPermission,
      extra: {
        permissionFlowState: locationPermissionFlowState,
        permissionSyncSource: locationPermissionSyncSource,
      },
    });
  }, [
    canAskLocationPermission,
    locationPermissionFlowState,
    locationPermissionStatus,
    locationPermissionSyncSource,
    mode,
    trackIslamicSessionEvent,
  ]);

  useEffect(() => {
    if (mode !== 'session' || !lastCameraPermissionFailure) {
      return;
    }

    const failureKey = [
      lastCameraPermissionFailure.code,
      lastCameraPermissionFailure.source,
      lastCameraPermissionFailure.message,
    ].join(':');
    if (lastTrackedCameraFailureRef.current === failureKey) {
      return;
    }

    lastTrackedCameraFailureRef.current = failureKey;
    trackStructuredFailure(
      lastCameraPermissionFailure.code === 'camera_module_load_failed'
        ? 'camera_module_load_failed'
        : 'camera_permission_request_failed',
      {
        permissionSyncSource: lastCameraPermissionFailure.source,
        errorMessage: lastCameraPermissionFailure.message,
        cameraPermissionFlowState,
      },
    );
  }, [cameraPermissionFlowState, lastCameraPermissionFailure, mode, trackStructuredFailure]);

  useEffect(() => {
    if (mode !== 'session' || !lastLocationPermissionFailure) {
      return;
    }

    const failureKey = [
      lastLocationPermissionFailure.code,
      lastLocationPermissionFailure.source,
      lastLocationPermissionFailure.message,
    ].join(':');
    if (lastTrackedLocationFailureRef.current === failureKey) {
      return;
    }

    lastTrackedLocationFailureRef.current = failureKey;
    trackStructuredFailure('location_permission_state_failed', {
      failureCode: lastLocationPermissionFailure.code,
      permissionSyncSource: lastLocationPermissionFailure.source,
      errorMessage: lastLocationPermissionFailure.message,
      locationPermissionFlowState,
    });
  }, [lastLocationPermissionFailure, locationPermissionFlowState, mode, trackStructuredFailure]);

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
      hasTrackedAlignmentStableRef.current = false;
    }
  }, [alignmentOffset, alignmentState, mode, trackIslamicSessionEvent]);

  const canAutoStartSession =
    mode === 'session' &&
    alignmentState === 'aligned' &&
    cameraPermissionFlowState === 'granted' &&
    locationPermissionFlowState === 'granted';

  useEffect(() => {
    if (mode !== 'session') {
      setSessionStartState('idle');
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      alignedAtRef.current = null;
      hasAutoAdvancedRef.current = false;
      return;
    }

    if (canAutoStartSession) {
      if (autoAdvanceTimeoutRef.current || hasAutoAdvancedRef.current) {
        return;
      }

      alignedAtRef.current = Date.now();
      setSessionStartState('stabilizing');
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        autoAdvanceTimeoutRef.current = null;
        const alignedDurationMs = Date.now() - (alignedAtRef.current ?? 0);
        if (
          latestAlignmentStateRef.current !== 'aligned' ||
          alignedDurationMs < ALIGNMENT_STABILITY_WINDOW_MS ||
          hasAutoAdvancedRef.current
        ) {
          setSessionStartState('idle');
          return;
        }

        if (!hasTrackedAlignmentStableRef.current) {
          hasTrackedAlignmentStableRef.current = true;
          void trackIslamicSessionEvent('alignment_stable_confirmed', {
            alignmentOffsetDegrees: latestAlignmentOffsetRef.current,
            extra: {
              stableDurationMs: alignedDurationMs,
            },
          });
        }
        openPrayerSession('auto');
      }, ALIGNMENT_STABILITY_WINDOW_MS);

      return;
    }

    setSessionStartState('idle');
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    alignedAtRef.current = null;
    hasTrackedAlignmentStableRef.current = false;
  }, [canAutoStartSession, mode, openPrayerSession, trackIslamicSessionEvent]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || pendingSettingsRefreshRef.current.size === 0) {
        return;
      }

      const pendingRefreshes = Array.from(pendingSettingsRefreshRef.current);
      pendingSettingsRefreshRef.current.clear();
      pendingRefreshes.forEach((permissionType) => {
        if (permissionType === 'camera') {
          void refreshCameraPermission('settingsReturn');
          return;
        }

        void refreshLocationPermission('settingsReturn');
      });
    });

    return () => {
      subscription.remove();
    };
  }, [refreshCameraPermission, refreshLocationPermission]);

  const handleCameraPermissionRequest = async () => {
    if (mode === 'session') {
      void trackIslamicSessionEvent('camera_permission_prompted', {
        permissionType: 'camera',
        permissionStatus: 'prompted',
        canAskAgain: canAskCameraPermission,
        extra: {
          permissionFlowState: cameraPermissionFlowState,
          permissionSyncSource: 'prompt',
        },
      });
    }
    await requestCameraPermission();
  };

  const showLocationRecoveryNotice =
    mode === 'session' &&
    locationPermissionFlowState !== 'granted' &&
    locationPermissionFlowState !== 'requesting' &&
    Boolean(locationError);

  const handleOpenSettings = React.useCallback((permissionType: 'camera' | 'location') => {
    pendingSettingsRefreshRef.current.add(permissionType);
    void Linking.openSettings();
  }, []);

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
              extra: {
                permissionFlowState: locationPermissionFlowState,
                permissionSyncSource: 'prompt',
              },
            });
          }
          void requestLocationPermission();
        }}
        onCameraModuleLoadFailure={(details) => {
          const failureKey = `${details.reason}:${details.errorMessage}`;
          if (lastTrackedCameraModuleFailureRef.current === failureKey) {
            return;
          }

          lastTrackedCameraModuleFailureRef.current = failureKey;
          trackStructuredFailure('camera_module_load_failed', {
            cameraPermissionFlowState,
            reason: details.reason,
            errorMessage: details.errorMessage,
          });
        }}
        onOpenCameraSettings={() => {
          handleOpenSettings('camera');
        }}
        onOpenLocationSettings={() => {
          handleOpenSettings('location');
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
        isTransitioningToPrayer={sessionStartState === 'starting'}
        onStartPrayerNow={() => openPrayerSession('manual')}
      />
    </View>
  );
}
