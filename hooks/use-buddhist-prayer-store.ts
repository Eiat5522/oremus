import { create } from 'zustand';

import type {
  AltarExperienceMode,
  MeritOption,
  ScanStatus,
} from '@/constants/buddhist-prayer/types';

interface BuddhistPrayerState {
  // Session
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
  // AR/Altar
  altarPlaced: boolean;
  placementScale: number;
  placementRotation: number;
  scanStatus: ScanStatus;
  altarExperienceMode: AltarExperienceMode;
  // UI
  isLoading: boolean;
  error: string | null;
}

interface BuddhistPrayerActions {
  // Scan flow
  startScan: () => void;
  surfaceDetected: () => void;
  // Altar placement
  placeAltar: () => void;
  updatePlacementScale: (scale: number) => void;
  updatePlacementRotation: (rotation: number) => void;
  resetPlacement: () => void;
  // Session lifecycle
  startPreparation: (chantId: string, isAR?: boolean) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  resetSession: () => void;
  // Verse navigation
  nextVerse: (totalVerses: number) => void;
  previousVerse: () => void;
  replayVerse: () => void;
  // Toggles
  toggleMeaning: () => void;
  toggleAutoScroll: () => void;
  toggleAudio: () => void;
  toggleTempleBell: () => void;
  // Merit
  selectMeritOption: (option: MeritOption) => void;
  // Error
  setError: (error: string | null) => void;
}

type BuddhistPrayerStore = BuddhistPrayerState & BuddhistPrayerActions;

const initialState: BuddhistPrayerState = {
  currentChantId: null,
  currentVerseIndex: 0,
  isPlaying: false,
  isPaused: false,
  isAudioEnabled: false,
  showMeaning: false,
  autoScroll: true,
  templeBellEnabled: false,
  isARMode: false,
  sessionStartedAt: null,
  sessionCompletedAt: null,
  meritOption: null,
  altarPlaced: false,
  placementScale: 1.0,
  placementRotation: 0,
  scanStatus: 'idle',
  altarExperienceMode: 'immersive3D',
  isLoading: false,
  error: null,
};

export const useBuddhistPrayerStore = create<BuddhistPrayerStore>((set) => ({
  ...initialState,

  startScan: () => set({ scanStatus: 'scanning', error: null }),

  surfaceDetected: () => set({ scanStatus: 'detected' }),

  placeAltar: () => set({ altarPlaced: true, scanStatus: 'placed' }),

  updatePlacementScale: (scale) => set({ placementScale: Math.max(0.5, Math.min(3.0, scale)) }),

  updatePlacementRotation: (rotation) => set({ placementRotation: rotation % 360 }),

  resetPlacement: () =>
    set({ altarPlaced: false, placementScale: 1.0, placementRotation: 0, scanStatus: 'idle' }),

  startPreparation: (chantId, isAR = false) =>
    set({
      currentChantId: chantId,
      currentVerseIndex: 0,
      isARMode: isAR,
      isPlaying: false,
      isPaused: false,
      sessionStartedAt: null,
      sessionCompletedAt: null,
      meritOption: null,
      error: null,
    }),

  startSession: () => set({ isPlaying: true, isPaused: false, sessionStartedAt: Date.now() }),

  pauseSession: () => set({ isPlaying: false, isPaused: true }),

  resumeSession: () => set({ isPlaying: true, isPaused: false }),

  completeSession: () => set({ isPlaying: false, isPaused: false, sessionCompletedAt: Date.now() }),

  resetSession: () => set({ ...initialState }),

  nextVerse: (totalVerses) =>
    set((state) => ({
      currentVerseIndex: Math.min(state.currentVerseIndex + 1, totalVerses - 1),
    })),

  previousVerse: () =>
    set((state) => ({
      currentVerseIndex: Math.max(state.currentVerseIndex - 1, 0),
    })),

  replayVerse: () => set((state) => ({ currentVerseIndex: state.currentVerseIndex })),

  toggleMeaning: () => set((state) => ({ showMeaning: !state.showMeaning })),

  toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),

  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  toggleTempleBell: () => set((state) => ({ templeBellEnabled: !state.templeBellEnabled })),

  selectMeritOption: (option) => set({ meritOption: option }),

  setError: (error) => set({ error }),
}));
