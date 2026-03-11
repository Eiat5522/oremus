import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PRAYER_LOCATION_STORAGE_KEY, type SavedPrayerLocation } from '@/lib/islam-prayer-location';
import { getQiblaBearing } from '@/lib/qibla';

export type QiblaAlignmentState = 'notAligned' | 'nearAligned' | 'aligned';

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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savedPrayerLocation, setSavedPrayerLocation] = useState<SavedPrayerLocation | null>(null);
  const [rawHeading, setRawHeading] = useState(0);
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [manualHeadingOffset, setManualHeadingOffset] = useState(0);
  const [alignmentState, setAlignmentState] = useState<QiblaAlignmentState>('notAligned');

  const alignmentStateRef = useRef<QiblaAlignmentState>('notAligned');
  const hasAlignedHapticRef = useRef(false);

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
    let mounted = true;
    let headingSubscription: Location.LocationSubscription | null = null;

    const setup = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;

        setLocationPermissionStatus(permission.status);
        if (permission.status !== 'granted') {
          setLocationError('Location access helps improve Qibla precision.');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        setCoords(current.coords);

        const heading = await Location.getHeadingAsync();
        const initialHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;

        if (mounted) {
          setRawHeading(initialHeading);
          setSmoothedHeading(initialHeading);
        }

        headingSubscription = await Location.watchHeadingAsync((nextHeading) => {
          if (!mounted) return;

          const liveHeading =
            nextHeading.trueHeading >= 0 ? nextHeading.trueHeading : nextHeading.magHeading;

          setRawHeading(liveHeading);
          setSmoothedHeading((prev) => {
            const delta = shortestSignedAngle(prev, liveHeading);
            return normalizeDegrees(prev + delta * HEADING_SMOOTHING_ALPHA);
          });
        });
      } catch {
        if (mounted) {
          setLocationError('Compass data is unavailable on this device.');
        }
      }
    };

    void setup();

    return () => {
      mounted = false;
      headingSubscription?.remove();
    };
  }, []);

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
    rawHeading,
    recenter,
    nudgeCalibration,
  };
}
