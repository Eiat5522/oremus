import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import {
  formatTime,
  getCurrentPrayerName,
  getNextPrayer,
  getPrayerTimesForDate,
  type PrayerName,
} from '@/lib/prayer-times';

const PRAYER_COMPLETION_STORAGE_KEY = '@oremus/islam-prayer-completion-v1';

type DailyPrayerCompletion = Record<PrayerName, boolean>;
type PrayerCompletionStore = Record<string, DailyPrayerCompletion>;

function getDefaultCompletionState(): DailyPrayerCompletion {
  return {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCountdown(target: Date, now: Date): string {
  const remainingMs = target.getTime() - now.getTime();
  if (remainingMs <= 0) return 'Now';

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours <= 0) {
    if (minutes <= 0) return 'Less than a minute';
    return `${minutes}m remaining`;
  }
  return `${hours}h ${minutes}m remaining`;
}

export function useIslamPrayerData(referenceDate?: Date) {
  const mountedRef = useRef(true);
  const [now, setNow] = useState(() => new Date());
  const effectiveDate = useMemo(() => referenceDate || now, [referenceDate, now]);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [locationText, setLocationText] = useState('Location access required');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [canAskLocationPermission, setCanAskLocationPermission] = useState(true);
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
  const [prayerCompletions, setPrayerCompletions] = useState<PrayerCompletionStore>({});

  const todayKey = useMemo(() => getLocalDateKey(effectiveDate), [effectiveDate]);

  const todayPrayers = useMemo(() => {
    if (!coords) return [];
    return getPrayerTimesForDate(coords.latitude, coords.longitude, effectiveDate);
  }, [coords, effectiveDate]);

  const nextPrayer = useMemo(() => getNextPrayer(todayPrayers, now), [todayPrayers, now]);

  const currentPrayerName = useMemo(
    () => getCurrentPrayerName(todayPrayers, now),
    [todayPrayers, now],
  );

  const todayCompletion = useMemo(
    () => prayerCompletions[todayKey] ?? getDefaultCompletionState(),
    [prayerCompletions, todayKey],
  );

  const completedCount = useMemo(
    () => Object.values(todayCompletion).filter(Boolean).length,
    [todayCompletion],
  );

  const progress = completedCount / 5;

  const countdownText = nextPrayer
    ? formatCountdown(nextPrayer.time, now)
    : 'No more prayers today';

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
      setLocationText('Unavailable');
      setLocationError('Unable to read location on this device.');
    } finally {
      if (mountedRef.current) {
        setIsRequestingLocationPermission(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPrayerCompletions = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
        if (!stored || !mounted) return;
        setPrayerCompletions(JSON.parse(stored) as PrayerCompletionStore);
      } catch {
        if (mounted) setPrayerCompletions({});
      }
    };

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

    void loadPrayerCompletions();
    void loadInitialPermission();

    return () => {
      mounted = false;
    };
  }, [requestLocationPermission]);

  const togglePrayerCompletion = useCallback(
    (name: PrayerName) => {
      setPrayerCompletions((previous) => {
        const dayState = previous[todayKey] ?? getDefaultCompletionState();
        const nextDayState: DailyPrayerCompletion = {
          ...dayState,
          [name]: !dayState[name],
        };
        const nextState: PrayerCompletionStore = {
          ...previous,
          [todayKey]: nextDayState,
        };
        void AsyncStorage.setItem(PRAYER_COMPLETION_STORAGE_KEY, JSON.stringify(nextState));
        return nextState;
      });
    },
    [todayKey],
  );

  return {
    now,
    todayPrayers,
    nextPrayer,
    currentPrayerName,
    todayCompletion,
    completedCount,
    progress,
    countdownText,
    locationText,
    locationError,
    locationPermissionStatus,
    canAskLocationPermission,
    isRequestingLocationPermission,
    requestLocationPermission,
    togglePrayerCompletion,
    formatTime,
  };
}
