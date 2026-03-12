import { create } from 'zustand';

import type { MeritOption, ScanStatus } from '@/src/features/buddhistPrayer/types/buddhistPrayer';
import { getNextVerse, getPreviousVerse } from '@/src/features/buddhistPrayer/utils/chantHelpers';

interface BuddhistPrayerState {
  currentChantId: string | null;
  currentVerseIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isAudioEnabled: boolean;
  showMeaning: boolean;
  autoScroll: boolean;
  templeBellEnabled: boolean;
  isARMode: boolean;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
  meritOption: MeritOption | null;
  altarPlaced: boolean;
  placementScale: number;
  placementRotation: number;
  scanStatus: ScanStatus;
  isLoading: boolean;
  error: string | null;
  startScan: () => void;
  surfaceDetected: () => void;
  placeAltar: () => void;
  updatePlacementScale: (scale: number) => void;
  updatePlacementRotation: (rotation: number) => void;
  resetPlacement: () => void;
  startPreparation: (chantId: string, isARMode?: boolean) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  nextVerse: (verseCount: number) => void;
  previousVerse: () => void;
  replayVerse: () => void;
  toggleMeaning: () => void;
  toggleAutoScroll: () => void;
  toggleAudio: () => void;
  toggleTempleBell: () => void;
  selectMeritOption: (option: MeritOption) => void;
  completeSession: () => void;
  resetSession: () => void;
}

const initialState = {
  currentChantId: null,
  currentVerseIndex: 0,
  isPlaying: false,
  isPaused: false,
  isAudioEnabled: false,
  showMeaning: true,
  autoScroll: false,
  templeBellEnabled: false,
  isARMode: false,
  sessionStartedAt: null,
  sessionCompletedAt: null,
  meritOption: null,
  altarPlaced: false,
  placementScale: 1,
  placementRotation: 0,
  scanStatus: 'idle' as ScanStatus,
  isLoading: false,
  error: null,
};

export const useBuddhistPrayerStore = create<BuddhistPrayerState>((set) => ({
  ...initialState,
  startScan: () => set({ scanStatus: 'scanning', isLoading: true }),
  surfaceDetected: () => set({ scanStatus: 'surface_detected', isLoading: false }),
  placeAltar: () => set({ altarPlaced: true }),
  updatePlacementScale: (scale) => set({ placementScale: Math.max(0.5, Math.min(1.8, scale)) }),
  updatePlacementRotation: (rotation) => set({ placementRotation: rotation }),
  resetPlacement: () => set({ placementScale: 1, placementRotation: 0, altarPlaced: false }),
  startPreparation: (chantId, isARMode = false) =>
    set({ currentChantId: chantId, isARMode, currentVerseIndex: 0, error: null }),
  startSession: () =>
    set({
      isPlaying: true,
      isPaused: false,
      sessionStartedAt: Date.now(),
      sessionCompletedAt: null,
    }),
  pauseSession: () => set({ isPaused: true, isPlaying: false }),
  resumeSession: () => set({ isPaused: false, isPlaying: true }),
  nextVerse: (verseCount) =>
    set((state) => ({ currentVerseIndex: getNextVerse(state.currentVerseIndex, verseCount) })),
  previousVerse: () =>
    set((state) => ({ currentVerseIndex: getPreviousVerse(state.currentVerseIndex) })),
  replayVerse: () => set((state) => ({ currentVerseIndex: state.currentVerseIndex })),
  toggleMeaning: () => set((state) => ({ showMeaning: !state.showMeaning })),
  toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  toggleTempleBell: () => set((state) => ({ templeBellEnabled: !state.templeBellEnabled })),
  selectMeritOption: (option) => set({ meritOption: option }),
  completeSession: () => set({ isPlaying: false, isPaused: false, sessionCompletedAt: Date.now() }),
  resetSession: () => set(initialState),
}));
