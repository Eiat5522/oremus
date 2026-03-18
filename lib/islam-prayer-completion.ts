import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerName } from '@/lib/prayer-times';

export const PRAYER_COMPLETION_STORAGE_KEY = '@oremus/islam-prayer-completion-v1';

const COMPLETION_TTL_DAYS = 30;

export type DailyPrayerCompletion = Record<PrayerName, boolean>;
export type PrayerCompletionStore = Record<string, DailyPrayerCompletion>;

let prayerCompletionWriteQueue: Promise<PrayerCompletionStore> = Promise.resolve({});

export function getDefaultCompletionState(): DailyPrayerCompletion {
  return {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pruneOldCompletions(store: PrayerCompletionStore): PrayerCompletionStore {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - COMPLETION_TTL_DAYS);
  const cutoffKey = getLocalDateKey(cutoff);
  return Object.fromEntries(Object.entries(store).filter(([key]) => key >= cutoffKey));
}

export async function loadPrayerCompletions(): Promise<PrayerCompletionStore> {
  try {
    const stored = await AsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as PrayerCompletionStore;
    const pruned = pruneOldCompletions(parsed);
    if (Object.keys(pruned).length < Object.keys(parsed).length) {
      await savePrayerCompletions(pruned);
    }
    return pruned;
  } catch {
    return {};
  }
}

export async function savePrayerCompletions(nextState: PrayerCompletionStore): Promise<void> {
  await AsyncStorage.setItem(PRAYER_COMPLETION_STORAGE_KEY, JSON.stringify(nextState));
}

export async function markPrayerComplete(
  prayerName: PrayerName,
  date: Date = new Date(),
): Promise<PrayerCompletionStore> {
  const run = async (): Promise<PrayerCompletionStore> => {
    const todayKey = getLocalDateKey(date);
    const previous = await loadPrayerCompletions();
    const dayState = previous[todayKey] ?? getDefaultCompletionState();
    const nextState: PrayerCompletionStore = {
      ...previous,
      [todayKey]: {
        ...dayState,
        [prayerName]: true,
      },
    };

    await savePrayerCompletions(nextState);
    return nextState;
  };

  const nextRun = prayerCompletionWriteQueue.then(run, run);
  prayerCompletionWriteQueue = nextRun.catch(() => ({}));
  return nextRun;
}
