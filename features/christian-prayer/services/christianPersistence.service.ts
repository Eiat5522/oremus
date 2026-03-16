import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ChristianAnalyticsEvent,
  ChristianReflectionDraft,
  CompletedChristianSessionRecord,
  FavoriteChristianVerseRecord,
} from '@/features/christian-prayer/constants';
import { addSessionLogEntry } from '@/lib/session-log';

export const CHRISTIAN_COMPLETED_SESSIONS_STORAGE_KEY = '@oremus/christian-completed-sessions-v1';
export const CHRISTIAN_FAVORITE_VERSES_STORAGE_KEY = '@oremus/christian-favorite-verses-v1';
export const CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY = '@oremus/christian-reflection-drafts-v1';
export const CHRISTIAN_ANALYTICS_STORAGE_KEY = '@oremus/christian-analytics-v1';

type ReflectionDraftStore = Record<
  string,
  ChristianReflectionDraft & {
    mode: string;
  }
>;

let persistenceQueue: Promise<unknown> = Promise.resolve();

function enqueuePersistence<T>(operation: () => Promise<T>): Promise<T> {
  const queuedOperation = persistenceQueue.then(operation);
  persistenceQueue = queuedOperation.then(
    () => undefined,
    () => undefined,
  );
  return queuedOperation;
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function loadCompletedChristianSessions(): Promise<CompletedChristianSessionRecord[]> {
  const raw = await AsyncStorage.getItem(CHRISTIAN_COMPLETED_SESSIONS_STORAGE_KEY);
  return parseJson(raw, [] as CompletedChristianSessionRecord[]);
}

export async function loadFavoriteChristianVerses(): Promise<FavoriteChristianVerseRecord[]> {
  const raw = await AsyncStorage.getItem(CHRISTIAN_FAVORITE_VERSES_STORAGE_KEY);
  return parseJson(raw, [] as FavoriteChristianVerseRecord[]);
}

export async function loadChristianReflectionDrafts(): Promise<ReflectionDraftStore> {
  const raw = await AsyncStorage.getItem(CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY);
  return parseJson(raw, {} as ReflectionDraftStore);
}

export async function loadChristianAnalyticsEvents(): Promise<ChristianAnalyticsEvent[]> {
  const raw = await AsyncStorage.getItem(CHRISTIAN_ANALYTICS_STORAGE_KEY);
  return parseJson(raw, [] as ChristianAnalyticsEvent[]);
}

export async function saveCompletedChristianSession(
  record: CompletedChristianSessionRecord,
): Promise<CompletedChristianSessionRecord[]> {
  return enqueuePersistence(async () => {
    const previous = await loadCompletedChristianSessions();
    const next = [record, ...previous.filter((item) => item.id !== record.id)].slice(0, 100);

    await AsyncStorage.setItem(CHRISTIAN_COMPLETED_SESSIONS_STORAGE_KEY, JSON.stringify(next));
    try {
      await addSessionLogEntry({
        tradition: 'christianity',
        startedAtMs: record.startedAtMs,
        completedAtMs: record.completedAtMs,
        durationSeconds: record.timeSpentSeconds,
      });
    } catch (error) {
      console.error('[ChristianPersistence] Failed to add session log entry.', error);
    }

    return next;
  });
}

export async function saveFavoriteChristianVerse(
  record: FavoriteChristianVerseRecord,
): Promise<FavoriteChristianVerseRecord[]> {
  return enqueuePersistence(async () => {
    const previous = await loadFavoriteChristianVerses();
    const next = [record, ...previous.filter((item) => item.verse.id !== record.verse.id)].slice(
      0,
      200,
    );

    await AsyncStorage.setItem(CHRISTIAN_FAVORITE_VERSES_STORAGE_KEY, JSON.stringify(next));
    return next;
  });
}

export async function saveChristianReflectionDraft(
  sessionId: string,
  mode: string,
  draft: ChristianReflectionDraft,
): Promise<ReflectionDraftStore> {
  return enqueuePersistence(async () => {
    const previous = await loadChristianReflectionDrafts();
    const next: ReflectionDraftStore = {
      ...previous,
      [sessionId]: {
        ...draft,
        mode,
      },
    };

    await AsyncStorage.setItem(CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY, JSON.stringify(next));
    return next;
  });
}

export async function clearChristianReflectionDraft(
  sessionId: string,
): Promise<ReflectionDraftStore> {
  return enqueuePersistence(async () => {
    const previous = await loadChristianReflectionDrafts();
    const next = { ...previous };
    delete next[sessionId];
    await AsyncStorage.setItem(CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY, JSON.stringify(next));
    return next;
  });
}

export async function appendChristianAnalyticsEvent(
  event: ChristianAnalyticsEvent,
): Promise<ChristianAnalyticsEvent[]> {
  return enqueuePersistence(async () => {
    const previous = await loadChristianAnalyticsEvents();
    const next = [event, ...previous].slice(0, 300);
    await AsyncStorage.setItem(CHRISTIAN_ANALYTICS_STORAGE_KEY, JSON.stringify(next));
    return next;
  });
}
