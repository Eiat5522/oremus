import AsyncStorage from '@react-native-async-storage/async-storage';

import { syncFocusGateNative } from '@/lib/focus-gate-native';

export const FOCUS_GATE_STORAGE_KEY = '@oremus/focus-gate-v1';

export const DEFAULT_SOCIAL_PACKAGES = [
  'com.facebook.katana',
  'com.instagram.android',
  'com.zhiliaoapp.musically',
] as const;

export const UNLOCK_WINDOW_OPTIONS = [15, 30, 60] as const;
export type UnlockWindowMinutes = (typeof UNLOCK_WINDOW_OPTIONS)[number];

export type FocusGateSettings = {
  enabled: boolean;
  unlockWindowMinutes: UnlockWindowMinutes;
  blockedPackages: string[];
  unlockUntilMs: number | null;
  lastPrayerCompletedAtMs: number | null;
};

const DEFAULT_FOCUS_GATE_SETTINGS: FocusGateSettings = {
  enabled: false,
  unlockWindowMinutes: 30,
  blockedPackages: [...DEFAULT_SOCIAL_PACKAGES],
  unlockUntilMs: null,
  lastPrayerCompletedAtMs: null,
};

function normalizeSettings(data: Partial<FocusGateSettings> | null): FocusGateSettings {
  const unlockWindowMinutes = UNLOCK_WINDOW_OPTIONS.includes(
    data?.unlockWindowMinutes as UnlockWindowMinutes,
  )
    ? (data?.unlockWindowMinutes as UnlockWindowMinutes)
    : DEFAULT_FOCUS_GATE_SETTINGS.unlockWindowMinutes;

  return {
    enabled: data?.enabled ?? DEFAULT_FOCUS_GATE_SETTINGS.enabled,
    unlockWindowMinutes,
    blockedPackages:
      data?.blockedPackages?.filter((item): item is string => typeof item === 'string') ??
      [...DEFAULT_FOCUS_GATE_SETTINGS.blockedPackages],
    unlockUntilMs: typeof data?.unlockUntilMs === 'number' ? data.unlockUntilMs : null,
    lastPrayerCompletedAtMs:
      typeof data?.lastPrayerCompletedAtMs === 'number' ? data.lastPrayerCompletedAtMs : null,
  };
}

export async function loadFocusGateSettings(): Promise<FocusGateSettings> {
  try {
    const stored = await AsyncStorage.getItem(FOCUS_GATE_STORAGE_KEY);
    if (!stored) return DEFAULT_FOCUS_GATE_SETTINGS;
    return normalizeSettings(JSON.parse(stored) as Partial<FocusGateSettings>);
  } catch {
    return DEFAULT_FOCUS_GATE_SETTINGS;
  }
}

export async function saveFocusGateSettings(nextSettings: FocusGateSettings): Promise<void> {
  const normalized = normalizeSettings(nextSettings);
  await AsyncStorage.setItem(FOCUS_GATE_STORAGE_KEY, JSON.stringify(normalized));
  await syncFocusGateNative(JSON.stringify(normalized));
}

let updateQueue: Promise<unknown> = Promise.resolve();

export async function updateFocusGateSettings(
  updater: (previous: FocusGateSettings) => FocusGateSettings,
): Promise<FocusGateSettings> {
  const result = (updateQueue = updateQueue.then(async () => {
    const previous = await loadFocusGateSettings();
    const next = updater(previous);
    await saveFocusGateSettings(next);
    return next;
  })) as Promise<FocusGateSettings>;
  return result;
}

export async function recordPrayerCompletion(): Promise<FocusGateSettings> {
  return updateFocusGateSettings((previous) => {
    const now = Date.now();
    return {
      ...previous,
      unlockUntilMs: now + previous.unlockWindowMinutes * 60 * 1000,
      lastPrayerCompletedAtMs: now,
    };
  });
}

export function getUnlockRemainingMs(settings: FocusGateSettings): number {
  if (!settings.unlockUntilMs) return 0;
  return Math.max(0, settings.unlockUntilMs - Date.now());
}

