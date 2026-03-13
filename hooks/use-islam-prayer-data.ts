import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePrayerLocationSettings } from '@/hooks/use-prayer-location-settings';
import {
  formatTime,
  getCurrentPrayerName,
  getNextPrayer,
  getPrayerTimesForDate,
  type PrayerTimeEntry,
  type PrayerName,
} from '@/lib/prayer-times';
import { recordPrayerCompletion } from '@/lib/focus-gate';

const PRAYER_COMPLETION_STORAGE_KEY = '@oremus/islam-prayer-completion-v1';
const PRAYER_RESCHEDULE_STORAGE_KEY = '@oremus/islam-prayer-rescheduled-v1';

type DailyPrayerCompletion = Record<PrayerName, boolean>;
type PrayerCompletionStore = Record<string, DailyPrayerCompletion>;

export interface RescheduledPrayerData {
  time: string; // ISO string
  hasReminder: boolean;
  reminderMinutes: number;
}

type DailyRescheduledPrayers = Record<PrayerName, RescheduledPrayerData>;
type PrayerRescheduleStore = Record<string, DailyRescheduledPrayers>;

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

function getComparisonTimeForDate(selectedDate: Date, now: Date): Date {
  const comparison = new Date(selectedDate);
  comparison.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return comparison;
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
  const [now, setNow] = useState(() => new Date());
  const effectiveDate = useMemo(() => referenceDate || now, [referenceDate, now]);
  const [prayerCompletions, setPrayerCompletions] = useState<PrayerCompletionStore>({});
  const [rescheduledPrayers, setRescheduledPrayers] = useState<PrayerRescheduleStore>({});
  const {
    prayerCoords,
    locationText,
    locationError,
    locationPermissionStatus,
    canAskLocationPermission,
    isRequestingLocationPermission,
    requestLocationPermission,
    savedPrayerLocation,
    selectSavedPrayerLocation,
    clearSavedPrayerLocation,
    isUsingDeviceLocation,
  } = usePrayerLocationSettings();

  const todayKey = useMemo(() => getLocalDateKey(effectiveDate), [effectiveDate]);

  const todayPrayers = useMemo(() => {
    if (!prayerCoords) return [];
    return getPrayerTimesForDate(prayerCoords.latitude, prayerCoords.longitude, effectiveDate);
  }, [prayerCoords, effectiveDate]);

  const comparisonNow = useMemo(
    () => getComparisonTimeForDate(effectiveDate, now),
    [effectiveDate, now],
  );

  const nextPrayer = useMemo(
    () => getNextPrayer(todayPrayers, comparisonNow),
    [todayPrayers, comparisonNow],
  );

  const defaultSessionPrayer = useMemo<PrayerTimeEntry | null>(() => {
    if (nextPrayer) {
      return nextPrayer;
    }

    if (!prayerCoords) {
      return null;
    }

    const tomorrow = new Date(effectiveDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      getPrayerTimesForDate(prayerCoords.latitude, prayerCoords.longitude, tomorrow).find(
        (prayer) => prayer.name === 'fajr',
      ) ?? null
    );
  }, [effectiveDate, nextPrayer, prayerCoords]);

  const currentPrayerName = useMemo(
    () => getCurrentPrayerName(todayPrayers, comparisonNow),
    [todayPrayers, comparisonNow],
  );

  const todayCompletion = useMemo(
    () => prayerCompletions[todayKey] ?? getDefaultCompletionState(),
    [prayerCompletions, todayKey],
  );

  const todayRescheduled = useMemo(
    () => rescheduledPrayers[todayKey] ?? {},
    [rescheduledPrayers, todayKey],
  );

  const completedCount = useMemo(
    () => Object.values(todayCompletion).filter(Boolean).length,
    [todayCompletion],
  );

  const progress = completedCount / 5;

  const countdownText = nextPrayer
    ? formatCountdown(nextPrayer.time, comparisonNow)
    : 'No more prayers today';

  const loadPrayerCompletions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
      if (!stored) {
        setPrayerCompletions({});
        return;
      }
      setPrayerCompletions(JSON.parse(stored) as PrayerCompletionStore);
    } catch {
      setPrayerCompletions({});
    }
  }, []);

  const loadRescheduledPrayers = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PRAYER_RESCHEDULE_STORAGE_KEY);
      if (!stored) {
        setRescheduledPrayers({});
        return;
      }
      setRescheduledPrayers(JSON.parse(stored) as PrayerRescheduleStore);
    } catch {
      setRescheduledPrayers({});
    }
  }, []);

  const refreshPrayerData = useCallback(async () => {
    await Promise.all([loadPrayerCompletions(), loadRescheduledPrayers()]);
  }, [loadPrayerCompletions, loadRescheduledPrayers]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshPrayerData();
  }, [refreshPrayerData]);

  const togglePrayerCompletion = useCallback(
    (name: PrayerName) => {
      const dayState = prayerCompletions[todayKey] ?? getDefaultCompletionState();
      const nextDayState: DailyPrayerCompletion = {
        ...dayState,
        [name]: !dayState[name],
      };
      const nextState: PrayerCompletionStore = {
        ...prayerCompletions,
        [todayKey]: nextDayState,
      };
      if (!dayState[name]) {
        void recordPrayerCompletion();
      }
      setPrayerCompletions(() => nextState);
      void AsyncStorage.setItem(PRAYER_COMPLETION_STORAGE_KEY, JSON.stringify(nextState));
    },
    [prayerCompletions, todayKey],
  );

  const reschedulePrayer = useCallback(
    (name: PrayerName, newTime: Date, hasReminder: boolean, reminderMinutes: number = 15) => {
      setRescheduledPrayers((previous) => {
        const dayState = previous[todayKey] ?? {};
        const nextDayState: DailyRescheduledPrayers = {
          ...dayState,
          [name]: {
            time: newTime.toISOString(),
            hasReminder,
            reminderMinutes,
          },
        };
        const nextState: PrayerRescheduleStore = {
          ...previous,
          [todayKey]: nextDayState,
        };
        void AsyncStorage.setItem(PRAYER_RESCHEDULE_STORAGE_KEY, JSON.stringify(nextState));
        return nextState;
      });
    },
    [todayKey],
  );

  const cancelReschedule = useCallback(
    (name: PrayerName) => {
      setRescheduledPrayers((previous) => {
        const dayState = previous[todayKey] ?? {};
        const { [name]: _, ...rest } = dayState;
        const nextState: PrayerRescheduleStore = {
          ...previous,
          [todayKey]: rest as DailyRescheduledPrayers,
        };
        void AsyncStorage.setItem(PRAYER_RESCHEDULE_STORAGE_KEY, JSON.stringify(nextState));
        return nextState;
      });
    },
    [todayKey],
  );

  const isPrayerRescheduled = useCallback(
    (name: PrayerName): boolean => {
      return name in todayRescheduled;
    },
    [todayRescheduled],
  );

  const getRescheduledTime = useCallback(
    (name: PrayerName): Date | null => {
      const data = todayRescheduled[name];
      return data ? new Date(data.time) : null;
    },
    [todayRescheduled],
  );

  return {
    now,
    todayPrayers,
    nextPrayer,
    defaultSessionPrayer,
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
    savedPrayerLocation,
    selectSavedPrayerLocation,
    clearSavedPrayerLocation,
    isUsingDeviceLocation,
    togglePrayerCompletion,
    formatTime,
    todayRescheduled,
    reschedulePrayer,
    cancelReschedule,
    isPrayerRescheduled,
    getRescheduledTime,
    refreshPrayerData,
  };
}
