import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  calculateSessionProgress,
  getChantBySlug,
  getNextVerse,
  getPreviousVerse,
} from '@/lib/chant-helpers';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

export function useChantSession() {
  const store = useBuddhistPrayerStore();
  const chantId = store.currentChantId ?? store.currentChantSlug;

  const currentChant = useMemo(
    () => (currentChantSlug ? getChantBySlug(currentChantSlug) : null),
    [currentChantSlug],
  );

  const currentChantId = useMemo(
    () => currentChant?.id ?? store.currentChantId,
    [currentChant?.id, store.currentChantId],
  );

  const currentVerse = useMemo(
    () => currentChant?.verses[currentVerseIndex] ?? null,
    [currentChant, currentVerseIndex],
  );

  const hasNextVerse = useMemo(
    () => (currentChant ? currentVerseIndex < currentChant.verses.length - 1 : false),
    [currentChant, currentVerseIndex],
  );

  const hasPreviousVerse = useMemo(() => currentVerseIndex > 0, [currentVerseIndex]);

  const progress = useMemo(
    () => (currentChant ? calculateSessionProgress(currentChant, currentVerseIndex) : 0),
    [currentChant, currentVerseIndex],
  );

  const sessionDurationSeconds = useMemo(() => {
    if (!sessionStartedAt) return 0;
    const endTime = sessionCompletedAt ?? Date.now();
    return Math.floor((endTime - sessionStartedAt) / 1000);
  }, [sessionCompletedAt, sessionStartedAt]);

  const nextVerseObj = useMemo(
    () => (currentChant ? getNextVerse(currentChant, currentVerseIndex) : null),
    [currentChant, currentVerseIndex],
  );

  const previousVerseObj = useMemo(
    () => (currentChant ? getPreviousVerse(currentChant, currentVerseIndex) : null),
    [currentChant, currentVerseIndex],
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
    versesCompleted: currentVerseIndex + 1,
  };
}
