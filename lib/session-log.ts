import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerName } from '@/lib/prayer-times';

const SESSION_LOG_STORAGE_KEY = '@oremus/session-log-v1';

export type SessionLogTradition = 'islam' | 'christianity' | 'buddhism' | 'general';

export type SessionLogEntry = {
  id: string;
  tradition: SessionLogTradition;
  prayerName?: PrayerName;
  startedAtMs: number;
  completedAtMs: number;
  durationSeconds: number;
};

type SessionLogInput = Omit<SessionLogEntry, 'id'>;

function normalizeEntry(entry: SessionLogInput): SessionLogEntry {
  const safeDuration = Number.isFinite(entry.durationSeconds)
    ? Math.max(0, Math.floor(entry.durationSeconds))
    : 0;

  return {
    ...entry,
    durationSeconds: safeDuration,
    id: `${entry.tradition}:${entry.prayerName ?? 'session'}:${entry.completedAtMs}`,
  };
}

function parseEntries(raw: string | null): SessionLogEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SessionLogEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

let sessionLogQueue: Promise<unknown> = Promise.resolve();

export async function getSessionLogEntries(): Promise<SessionLogEntry[]> {
  const raw = await AsyncStorage.getItem(SESSION_LOG_STORAGE_KEY);
  return parseEntries(raw);
}

export async function addSessionLogEntry(entry: SessionLogInput): Promise<SessionLogEntry[]> {
  const normalized = normalizeEntry(entry);

  const result = (sessionLogQueue = sessionLogQueue.then(async () => {
    const existing = await getSessionLogEntries();
    const next = [normalized, ...existing].slice(0, 250);
    await AsyncStorage.setItem(SESSION_LOG_STORAGE_KEY, JSON.stringify(next));
    return next;
  })) as Promise<SessionLogEntry[]>;

  return result;
}
