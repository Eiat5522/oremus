import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  PRAYER_LOCATION_PRESETS,
  PRAYER_LOCATION_STORAGE_KEY,
  type SavedPrayerLocation,
} from '@/lib/islam-prayer-location';

type UsePrayerLocationSettingsOptions = {
  enabled?: boolean;
};

export function usePrayerLocationSettings(options: UsePrayerLocationSettingsOptions = {}) {
  const { enabled = true } = options;
  const mountedRef = useRef(true);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [locationText, setLocationText] = useState('Location access required');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [canAskLocationPermission, setCanAskLocationPermission] = useState(true);
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
  const [savedPrayerLocation, setSavedPrayerLocation] = useState<SavedPrayerLocation | null>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      if (!mountedRef.current) return;
      setIsRequestingLocationPermission(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!mountedRef.current) return;
      setLocationPermissionStatus(permission.status);
      setCanAskLocationPermission(permission.canAskAgain);

      if (permission.status !== 'granted') {
        setCoords(null);
        setLocationText('Permission required');
        setLocationError(
          permission.canAskAgain
            ? 'Location permission is required to calculate daily prayer times.'
            : 'Location permission is blocked. Enable location access in settings.',
        );
        return;
      }

      setLocationError(null);
      setLocationText('Locating...');

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!mountedRef.current) return;
      setCoords(current.coords);

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        if (!mountedRef.current) return;
        if (reverse.length > 0) {
          const place = reverse[0];
          setLocationText(
            [place.city, place.region, place.country]
              .filter((value): value is string => Boolean(value))
              .join(', ') || 'Current location',
          );
        } else {
          setLocationText(
            `${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`,
          );
        }
      } catch {
        if (!mountedRef.current) return;
        setLocationText(
          `${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`,
        );
      }
    } catch {
      if (!mountedRef.current) return;
      setCoords(null);
      setLocationText('Unavailable');
      setLocationError('Unable to read location on this device.');
    } finally {
      if (mountedRef.current) {
        setIsRequestingLocationPermission(false);
      }
    }
  }, []);

  const loadSavedPrayerLocation = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PRAYER_LOCATION_STORAGE_KEY);
      if (!mountedRef.current) return;
      if (!stored) {
        setSavedPrayerLocation(null);
        return;
      }

      const parsed = JSON.parse(stored) as Partial<SavedPrayerLocation>;
      if (
        typeof parsed.id !== 'string' ||
        typeof parsed.label !== 'string' ||
        typeof parsed.latitude !== 'number' ||
        typeof parsed.longitude !== 'number'
      ) {
        setSavedPrayerLocation(null);
        return;
      }

      setSavedPrayerLocation({
        id: parsed.id,
        label: parsed.label,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      });
    } catch {
      if (mountedRef.current) {
        setSavedPrayerLocation(null);
      }
    }
  }, []);

  const selectSavedPrayerLocation = useCallback(
    async (locationId: string) => {
      const location = PRAYER_LOCATION_PRESETS.find((item) => item.id === locationId);
      if (!location) {
        return;
      }

      const nextLocation: SavedPrayerLocation = {
        id: location.id,
        label: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const previousLocation = savedPrayerLocation;

      if (mountedRef.current) {
        setSavedPrayerLocation(nextLocation);
      }

      try {
        await AsyncStorage.setItem(PRAYER_LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
      } catch (error) {
        if (mountedRef.current) {
          setSavedPrayerLocation(previousLocation);
        }
        console.error('Failed to save prayer location setting.', error);
      }
    },
    [savedPrayerLocation],
  );

  const clearSavedPrayerLocation = useCallback(async () => {
    const previousLocation = savedPrayerLocation;

    if (mountedRef.current) {
      setSavedPrayerLocation(null);
    }

    try {
      await AsyncStorage.removeItem(PRAYER_LOCATION_STORAGE_KEY);
    } catch (error) {
      if (mountedRef.current) {
        setSavedPrayerLocation(previousLocation);
      }
      console.error('Failed to clear prayer location setting.', error);
    }
  }, [savedPrayerLocation]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;

    const loadInitialPermission = async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!mounted) return;
        setLocationPermissionStatus(permission.status);
        setCanAskLocationPermission(permission.canAskAgain);

        if (permission.status === 'granted') {
          await requestLocationPermission();
        } else {
          setLocationText('Location access required');
        }
      } catch {
        if (!mounted) return;
        setLocationText('Unavailable');
        setLocationError('Unable to read location permission on this device.');
      }
    };

    void loadSavedPrayerLocation();
    void loadInitialPermission();

    return () => {
      mounted = false;
    };
  }, [enabled, loadSavedPrayerLocation, requestLocationPermission]);

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

  const resolvedLocationText = useMemo(() => {
    if (coords) {
      return locationText;
    }
    if (savedPrayerLocation) {
      return savedPrayerLocation.label;
    }
    return locationText;
  }, [coords, locationText, savedPrayerLocation]);

  return {
    coords,
    prayerCoords,
    locationText: resolvedLocationText,
    locationError,
    locationPermissionStatus,
    canAskLocationPermission,
    isRequestingLocationPermission,
    requestLocationPermission,
    savedPrayerLocation,
    selectSavedPrayerLocation,
    clearSavedPrayerLocation,
    isUsingDeviceLocation: Boolean(coords),
  };
}
