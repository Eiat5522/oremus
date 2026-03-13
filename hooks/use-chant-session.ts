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
  const {
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
  } = useBuddhistPrayerStore(
    useShallow((state) => ({
      currentChantSlug: state.currentChantSlug,
      currentVerseIndex: state.currentVerseIndex,
      isPlaying: state.isPlaying,
      isPaused: state.isPaused,
      isAudioEnabled: state.isAudioEnabled,
      showMeaning: state.showMeaning,
      autoScroll: state.autoScroll,
      templeBellEnabled: state.templeBellEnabled,
      isARMode: state.isARMode,
      sessionStartedAt: state.sessionStartedAt,
      sessionCompletedAt: state.sessionCompletedAt,
      meritOption: state.meritOption,
      dedicationNote: state.dedicationNote,
      altarPlaced: state.altarPlaced,
      placementScale: state.placementScale,
      placementRotation: state.placementRotation,
      scanStatus: state.scanStatus,
      altarExperienceMode: state.altarExperienceMode,
      isLoading: state.isLoading,
      error: state.error,
      nextVerse: state.nextVerse,
      previousVerse: state.previousVerse,
      replayVerse: state.replayVerse,
      pauseSession: state.pauseSession,
      resumeSession: state.resumeSession,
      completeSession: state.completeSession,
    })),
  );

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
