import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PRAYER_LOCATION_STORAGE_KEY, type SavedPrayerLocation } from '@/lib/islam-prayer-location';
import { getQiblaBearing } from '@/lib/qibla';
import {
  getQiblaPermissionFlowState,
  type QiblaPermissionFlowState,
  type QiblaPermissionSyncSource,
} from '@/lib/qibla-permission-state';

export type QiblaAlignmentState = 'notAligned' | 'nearAligned' | 'aligned';
export type LocationPermissionFailureCode =
  | 'location_permission_request_failed'
  | 'location_permission_state_failed';

export type LocationPermissionFailure = {
  code: LocationPermissionFailureCode;
  message: string;
  source: QiblaPermissionSyncSource;
  permissionStatus?: Location.PermissionStatus | null;
  canAskAgain?: boolean;
};

const ALIGNED_ENTER = 5;
const ALIGNED_EXIT = 7;
const NEAR_ENTER = 15;
const NEAR_EXIT = 17;
const HEADING_SMOOTHING_ALPHA = 0.18;

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function shortestSignedAngle(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function getAlignmentState(offset: number, previous: QiblaAlignmentState): QiblaAlignmentState {
  if (previous === 'aligned') {
    if (offset <= ALIGNED_EXIT) return 'aligned';
    if (offset <= NEAR_ENTER) return 'nearAligned';
    return 'notAligned';
  }

  if (previous === 'nearAligned') {
    if (offset < ALIGNED_ENTER) return 'aligned';
    if (offset <= NEAR_EXIT) return 'nearAligned';
    return 'notAligned';
  }

  if (offset < ALIGNED_ENTER) return 'aligned';
  if (offset <= NEAR_ENTER) return 'nearAligned';
  return 'notAligned';
}

export function useQiblaAlignment() {
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [canAskLocationPermission, setCanAskLocationPermission] = useState(true);
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
  const [locationPermissionFlowState, setLocationPermissionFlowState] =
    useState<QiblaPermissionFlowState>('coldStart');
  const [locationPermissionSyncSource, setLocationPermissionSyncSource] =
    useState<QiblaPermissionSyncSource>('coldStart');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocationPermissionFailure, setLastLocationPermissionFailure] =
    useState<LocationPermissionFailure | null>(null);
  const [savedPrayerLocation, setSavedPrayerLocation] = useState<SavedPrayerLocation | null>(null);
  const [rawHeading, setRawHeading] = useState(0);
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [manualHeadingOffset, setManualHeadingOffset] = useState(0);
  const [alignmentState, setAlignmentState] = useState<QiblaAlignmentState>('notAligned');

  const alignmentStateRef = useRef<QiblaAlignmentState>('notAligned');
  const hasAlignedHapticRef = useRef(false);
  const isMountedRef = useRef(true);
  const headingSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const locationPermissionStatusRef = useRef<Location.PermissionStatus | null>(null);
  const canAskLocationPermissionRef = useRef(true);

  const clearLiveLocationState = useCallback(() => {
    headingSubscriptionRef.current?.remove();
    headingSubscriptionRef.current = null;
    setCoords(null);
  }, []);

  const applyLocationPermissionState = useCallback(
    (
      permission: Pick<Location.LocationPermissionResponse, 'status' | 'canAskAgain'>,
      source: QiblaPermissionSyncSource,
    ) => {
      locationPermissionStatusRef.current = permission.status;
      canAskLocationPermissionRef.current = permission.canAskAgain;
      setLocationPermissionStatus(permission.status);
      setCanAskLocationPermission(permission.canAskAgain);
      setLocationPermissionSyncSource(source);
      setLocationPermissionFlowState(
        getQiblaPermissionFlowState({
          status: permission.status,
          canAskAgain: permission.canAskAgain,
          isRequesting: false,
        }),
      );

      if (permission.status !== 'granted') {
        clearLiveLocationState();
        setLocationError(
          permission.canAskAgain
            ? 'Location access helps improve Qibla precision.'
            : 'Location access is blocked. Enable it in settings to continue.',
        );
      } else {
        setLocationError(null);
      }
    },
    [clearLiveLocationState],
  );

  const setLocationFailureState = useCallback(
    (failure: LocationPermissionFailure) => {
      if (!isMountedRef.current) {
        return;
      }

      const nextStatus =
        failure.permissionStatus ??
        locationPermissionStatusRef.current ??
        Location.PermissionStatus.DENIED;
      const nextCanAskAgain =
        failure.permissionStatus === Location.PermissionStatus.GRANTED
          ? true
          : (failure.canAskAgain ?? canAskLocationPermissionRef.current);

      locationPermissionStatusRef.current = nextStatus;
      canAskLocationPermissionRef.current = nextCanAskAgain;

      clearLiveLocationState();
      setLastLocationPermissionFailure(failure);
      setLocationPermissionSyncSource(failure.source);
      setLocationPermissionStatus(nextStatus);
      setCanAskLocationPermission(nextCanAskAgain);
      setLocationPermissionFlowState(
        getQiblaPermissionFlowState({
          status: nextStatus,
          canAskAgain: nextCanAskAgain,
          isRequesting: false,
        }),
      );
      setLocationError('Unable to access location services.');
    },
    [clearLiveLocationState],
  );

  const syncGrantedLocationState = useCallback(async () => {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    if (!isMountedRef.current) return;
    setCoords(current.coords);

    const heading = await Location.getHeadingAsync();
    if (!isMountedRef.current) return;

    const initialHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
    setRawHeading(initialHeading);
    setSmoothedHeading(initialHeading);

    headingSubscriptionRef.current?.remove();
    headingSubscriptionRef.current = await Location.watchHeadingAsync((nextHeading) => {
      if (!isMountedRef.current) return;

      const liveHeading =
        nextHeading.trueHeading >= 0 ? nextHeading.trueHeading : nextHeading.magHeading;

      setRawHeading(liveHeading);
      setSmoothedHeading((prev) => {
        const delta = shortestSignedAngle(prev, liveHeading);
        return normalizeDegrees(prev + delta * HEADING_SMOOTHING_ALPHA);
      });
    });
  }, []);

  const prayerCoords = useMemo(() => {
    if (coords) {
      return coords;
    }

    if (savedPrayerLocation) {
      return {
        latitude: savedPrayerLocation.latitude,
        longitude: savedPrayerLocation.longitude,
      };
    }

    return null;
  }, [coords, savedPrayerLocation]);

  const qiblaBearing = useMemo(() => {
    if (!prayerCoords) return null;
    return getQiblaBearing(prayerCoords.latitude, prayerCoords.longitude);
  }, [prayerCoords]);

  const effectiveHeading = useMemo(
    () => normalizeDegrees(smoothedHeading + manualHeadingOffset),
    [manualHeadingOffset, smoothedHeading],
  );

  const signedOffset = useMemo(() => {
    if (qiblaBearing === null) return null;
    return shortestSignedAngle(effectiveHeading, qiblaBearing);
  }, [effectiveHeading, qiblaBearing]);

  const alignmentOffset = useMemo(() => {
    if (signedOffset === null) return null;
    return Math.abs(signedOffset);
  }, [signedOffset]);

  useEffect(() => {
    if (alignmentOffset === null) {
      setAlignmentState('notAligned');
      alignmentStateRef.current = 'notAligned';
      return;
    }

    const nextState = getAlignmentState(alignmentOffset, alignmentStateRef.current);
    alignmentStateRef.current = nextState;
    setAlignmentState(nextState);
  }, [alignmentOffset]);

  useEffect(() => {
    if (alignmentState === 'aligned' && !hasAlignedHapticRef.current) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      hasAlignedHapticRef.current = true;
      return;
    }

    if (alignmentState !== 'aligned') {
      hasAlignedHapticRef.current = false;
    }
  }, [alignmentState]);

  useEffect(() => {
    isMountedRef.current = true;
    let mounted = true;

    const loadSavedPrayerLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRAYER_LOCATION_STORAGE_KEY);
        if (!stored || !mounted) return;

        const parsed = JSON.parse(stored) as Partial<SavedPrayerLocation>;
        if (
          typeof parsed.id !== 'string' ||
          typeof parsed.label !== 'string' ||
          typeof parsed.latitude !== 'number' ||
          typeof parsed.longitude !== 'number'
        ) {
          return;
        }

        setSavedPrayerLocation({
          id: parsed.id,
          label: parsed.label,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        });
      } catch {
        // ignore invalid cache
      }
    };

    void loadSavedPrayerLocation();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        setIsRequestingLocationPermission(true);
        setLocationPermissionFlowState('requesting');
        setLocationPermissionSyncSource('coldStart');
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!isMountedRef.current) return;

        applyLocationPermissionState(permission, 'coldStart');
        if (permission.status !== 'granted') {
          return;
        }

        setLastLocationPermissionFailure(null);
        try {
          await syncGrantedLocationState();
        } catch (error) {
          setLocationFailureState({
            code: 'location_permission_state_failed',
            message:
              error instanceof Error ? error.message : 'Unable to initialize location services.',
            source: 'coldStart',
            permissionStatus: permission.status,
            canAskAgain: permission.canAskAgain,
          });
        }
      } catch (error) {
        setLocationFailureState({
          code: 'location_permission_state_failed',
          message:
            error instanceof Error ? error.message : 'Unable to initialize location services.',
          source: 'coldStart',
        });
      } finally {
        if (isMountedRef.current) {
          setIsRequestingLocationPermission(false);
        }
      }
    };

    void setup();

    return () => {
      isMountedRef.current = false;
      headingSubscriptionRef.current?.remove();
      headingSubscriptionRef.current = null;
    };
  }, [applyLocationPermissionState, setLocationFailureState, syncGrantedLocationState]);

  const requestLocationPermission = useCallback(async () => {
    setIsRequestingLocationPermission(true);
    setLocationPermissionFlowState('requesting');
    setLocationPermissionSyncSource('prompt');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!isMountedRef.current) {
        return permission;
      }

      applyLocationPermissionState(permission, 'prompt');

      if (permission.status !== 'granted') {
        return permission;
      }

      setLastLocationPermissionFailure(null);
      try {
        await syncGrantedLocationState();
      } catch (error) {
        setLocationFailureState({
          code: 'location_permission_request_failed',
          message:
            error instanceof Error ? error.message : 'Unable to request location permission.',
          source: 'prompt',
          permissionStatus: permission.status,
          canAskAgain: permission.canAskAgain,
        });
      }
      return permission;
    } catch (error) {
      setLocationFailureState({
        code: 'location_permission_request_failed',
        message: error instanceof Error ? error.message : 'Unable to request location permission.',
        source: 'prompt',
      });
      return {
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false,
        granted: false,
        expires: 'never',
      } as Location.LocationPermissionResponse;
    } finally {
      if (isMountedRef.current) {
        setIsRequestingLocationPermission(false);
      }
    }
  }, [applyLocationPermissionState, setLocationFailureState, syncGrantedLocationState]);

  const refreshLocationPermission = useCallback(
    async (source: QiblaPermissionSyncSource = 'settingsReturn') => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!isMountedRef.current) {
          return permission;
        }

        applyLocationPermissionState(permission, source);
        if (permission.status === 'granted') {
          setLastLocationPermissionFailure(null);
          try {
            await syncGrantedLocationState();
          } catch (error) {
            setLocationFailureState({
              code: 'location_permission_state_failed',
              message:
                error instanceof Error ? error.message : 'Unable to refresh location permission.',
              source,
              permissionStatus: permission.status,
              canAskAgain: permission.canAskAgain,
            });
          }
        }
        return permission;
      } catch (error) {
        setLocationFailureState({
          code: 'location_permission_state_failed',
          message:
            error instanceof Error ? error.message : 'Unable to refresh location permission.',
          source,
        });
        return {
          status: Location.PermissionStatus.DENIED,
          canAskAgain: false,
          granted: false,
          expires: 'never',
        } as Location.LocationPermissionResponse;
      }
    },
    [applyLocationPermissionState, setLocationFailureState, syncGrantedLocationState],
  );

  const recenter = useCallback(async () => {
    setManualHeadingOffset(0);
    const heading = await Location.getHeadingAsync();
    const nextHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
    setRawHeading(nextHeading);
    setSmoothedHeading(nextHeading);
  }, []);

  const nudgeCalibration = useCallback((delta: number) => {
    setManualHeadingOffset((current) => current + delta);
  }, []);

  return {
    qiblaBearing,
    alignmentOffset,
    signedOffset,
    alignmentState,
    isAligned: alignmentState === 'aligned',
    manualHeadingOffset,
    locationError,
    locationPermissionStatus,
    locationPermissionFlowState,
    locationPermissionSyncSource,
    canAskLocationPermission,
    isRequestingLocationPermission,
    lastLocationPermissionFailure,
    rawHeading,
    requestLocationPermission,
    refreshLocationPermission,
    recenter,
    nudgeCalibration,
  };
}
