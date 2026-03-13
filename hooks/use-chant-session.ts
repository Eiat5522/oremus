import { useMemo } from 'react';

import {
  calculateSessionProgress,
  getChantBySlug,
  getNextVerse,
  getPreviousVerse,
} from '@/lib/chant-helpers';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

export function useChantSession() {
  const currentChantSlug = useBuddhistPrayerStore((state) => state.currentChantSlug);
  const currentVerseIndex = useBuddhistPrayerStore((state) => state.currentVerseIndex);
  const sessionStartedAt = useBuddhistPrayerStore((state) => state.sessionStartedAt);
  const sessionCompletedAt = useBuddhistPrayerStore((state) => state.sessionCompletedAt);
  const nextVerse = useBuddhistPrayerStore((state) => state.nextVerse);
  const previousVerse = useBuddhistPrayerStore((state) => state.previousVerse);
  const replayVerse = useBuddhistPrayerStore((state) => state.replayVerse);
  const pauseSession = useBuddhistPrayerStore((state) => state.pauseSession);
  const resumeSession = useBuddhistPrayerStore((state) => state.resumeSession);
  const completeSession = useBuddhistPrayerStore((state) => state.completeSession);
  const isPlaying = useBuddhistPrayerStore((state) => state.isPlaying);
  const isPaused = useBuddhistPrayerStore((state) => state.isPaused);
  const isAudioEnabled = useBuddhistPrayerStore((state) => state.isAudioEnabled);
  const showMeaning = useBuddhistPrayerStore((state) => state.showMeaning);
  const autoScroll = useBuddhistPrayerStore((state) => state.autoScroll);
  const templeBellEnabled = useBuddhistPrayerStore((state) => state.templeBellEnabled);
  const isARMode = useBuddhistPrayerStore((state) => state.isARMode);
  const meritOption = useBuddhistPrayerStore((state) => state.meritOption);
  const dedicationNote = useBuddhistPrayerStore((state) => state.dedicationNote);
  const altarPlaced = useBuddhistPrayerStore((state) => state.altarPlaced);
  const placementScale = useBuddhistPrayerStore((state) => state.placementScale);
  const placementRotation = useBuddhistPrayerStore((state) => state.placementRotation);
  const scanStatus = useBuddhistPrayerStore((state) => state.scanStatus);
  const altarExperienceMode = useBuddhistPrayerStore((state) => state.altarExperienceMode);
  const isLoading = useBuddhistPrayerStore((state) => state.isLoading);
  const error = useBuddhistPrayerStore((state) => state.error);

  const currentChant = useMemo(
    () => (currentChantSlug ? getChantBySlug(currentChantSlug) : null),
    [currentChantSlug],
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
    currentChantSlug,
    currentVerseIndex,
    isPlaying,
    isPaused,
    isAudioEnabled,
    showMeaning,
    autoScroll,
    templeBellEnabled,
    isARMode,
    sessionStartedAt,
    sessionCompletedAt,
    meritOption,
    dedicationNote,
    altarPlaced,
    placementScale,
    placementRotation,
    scanStatus,
    altarExperienceMode,
    isLoading,
    error,
    nextVerse,
    previousVerse,
    replayVerse,
    pauseSession,
    resumeSession,
    completeSession,
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
