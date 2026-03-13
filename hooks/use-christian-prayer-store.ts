import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChristianPrayerPreferenceState } from '@/constants/christian-prayer';

interface ChristianPrayerState extends ChristianPrayerPreferenceState {
  selectedTemplateId: string | null;
  currentStageIndex: number;
  stageReplayToken: number;
  isPlaying: boolean;
  isPaused: boolean;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
}

interface ChristianPrayerActions {
  startPreparation: (templateId: string) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  resetSession: () => void;
  clearSessionHistory: () => void;
  nextStage: (totalStages: number) => void;
  previousStage: () => void;
  replayStage: () => void;
  setAutoAdvance: (value: boolean) => void;
  setAmbientAudioEnabled: (value: boolean) => void;
  setShowScriptureFirst: (value: boolean) => void;
}

type ChristianPrayerStore = ChristianPrayerState & ChristianPrayerActions;

const initialPreferences: ChristianPrayerPreferenceState = {
  autoAdvance: true,
  ambientAudioEnabled: false,
  showScriptureFirst: true,
};

const initialSessionState: Omit<ChristianPrayerState, keyof ChristianPrayerPreferenceState> = {
  selectedTemplateId: null,
  currentStageIndex: 0,
  stageReplayToken: 0,
  isPlaying: false,
  isPaused: false,
  sessionStartedAt: null,
  sessionCompletedAt: null,
};

const initialState: ChristianPrayerState = {
  ...initialPreferences,
  ...initialSessionState,
};

export const useChristianPrayerStore = create<ChristianPrayerStore>()(
  persist(
    (set) => ({
      ...initialState,

      startPreparation: (templateId) =>
        set(() => ({
          selectedTemplateId: templateId,
          currentStageIndex: 0,
          stageReplayToken: 0,
          isPlaying: false,
          isPaused: false,
          sessionStartedAt: null,
          sessionCompletedAt: null,
        })),

      startSession: () =>
        set((state) => ({
          isPlaying: true,
          isPaused: false,
          sessionStartedAt: state.sessionStartedAt ?? Date.now(),
          sessionCompletedAt: null,
        })),

      pauseSession: () => set(() => ({ isPlaying: false, isPaused: true })),
      resumeSession: () => set(() => ({ isPlaying: true, isPaused: false })),
      completeSession: () =>
        set((state) => ({
          isPlaying: false,
          isPaused: false,
          sessionCompletedAt: state.sessionCompletedAt ?? Date.now(),
        })),

      resetSession: () =>
        set((state) => ({
          ...initialSessionState,
          autoAdvance: state.autoAdvance,
          ambientAudioEnabled: state.ambientAudioEnabled,
          showScriptureFirst: state.showScriptureFirst,
        })),

      clearSessionHistory: () =>
        set((state) => ({
          ...initialSessionState,
          autoAdvance: state.autoAdvance,
          ambientAudioEnabled: state.ambientAudioEnabled,
          showScriptureFirst: state.showScriptureFirst,
        })),

      nextStage: (totalStages) =>
        set((state) => ({
          currentStageIndex: Math.min(state.currentStageIndex + 1, totalStages - 1),
          stageReplayToken: 0,
        })),

      previousStage: () =>
        set((state) => ({
          currentStageIndex: Math.max(state.currentStageIndex - 1, 0),
          stageReplayToken: 0,
        })),

      replayStage: () =>
        set((state) => ({
          stageReplayToken: state.stageReplayToken + 1,
        })),

      setAutoAdvance: (value) => set(() => ({ autoAdvance: value })),
      setAmbientAudioEnabled: (value) => set(() => ({ ambientAudioEnabled: value })),
      setShowScriptureFirst: (value) => set(() => ({ showScriptureFirst: value })),
    }),
    {
      name: 'christian-prayer-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
