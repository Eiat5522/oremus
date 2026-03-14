import { useMemo } from 'react';

import {
  calculateSessionProgress,
  getChantBySlug,
  getNextVerse,
  getPreviousVerse,
} from '@/lib/chant-helpers';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

export function useChantSession() {
  const store = useBuddhistPrayerStore();

  const currentChant = useMemo(
    () => (store.currentChantSlug ? getChantBySlug(store.currentChantSlug) : null),
    [store.currentChantSlug],
  );

  const currentChantId = useMemo(
    () => currentChant?.id ?? store.currentChantId,
    [currentChant?.id, store.currentChantId],
  );

  const currentVerse = useMemo(
    () => currentChant?.verses[store.currentVerseIndex] ?? null,
    [currentChant, store.currentVerseIndex],
  );

  const hasNextVerse = useMemo(
    () => (currentChant ? store.currentVerseIndex < currentChant.verses.length - 1 : false),
    [currentChant, store.currentVerseIndex],
  );

  const hasPreviousVerse = useMemo(() => store.currentVerseIndex > 0, [store.currentVerseIndex]);

  const progress = useMemo(
    () => (currentChant ? calculateSessionProgress(currentChant, store.currentVerseIndex) : 0),
    [currentChant, store.currentVerseIndex],
  );

  const sessionDurationSeconds = useMemo(() => {
    if (!store.sessionStartedAt) return 0;
    const endTime = store.sessionCompletedAt ?? Date.now();
    return Math.floor((endTime - store.sessionStartedAt) / 1000);
  }, [store.sessionStartedAt, store.sessionCompletedAt]);

  const nextVerseObj = useMemo(
    () => (currentChant ? getNextVerse(currentChant, store.currentVerseIndex) : null),
    [currentChant, store.currentVerseIndex],
  );

  const previousVerseObj = useMemo(
    () => (currentChant ? getPreviousVerse(currentChant, store.currentVerseIndex) : null),
    [currentChant, store.currentVerseIndex],
  );

  return {
    ...store,
    currentChantId,
    currentChant: currentChant ?? null,
    currentVerse,
    hasNextVerse,
    hasPreviousVerse,
    progress,
    sessionDurationSeconds,
    nextVerseObj,
    previousVerseObj,
    totalVerses: currentChant?.verses.length ?? 0,
    versesCompleted: store.currentVerseIndex + 1,
  };
}
