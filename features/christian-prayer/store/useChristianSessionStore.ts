import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ChristianAudioSettings,
  ChristianPrayerPhase,
  ChristianSessionActions,
  ChristianSessionState,
  PrayerCornerTransform,
} from '@/features/christian-prayer/constants';
import {
  DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
  buildChristianDraftState,
  getChristianNextPhase,
  normalizePrayerCornerTransform,
} from '@/features/christian-prayer/services/christianSession.service';
import { getSuggestedChristianVerse } from '@/features/christian-prayer/services/christianContent.service';

const defaultAudioSettings: ChristianAudioSettings = {
  narrationEnabled: true,
  ambientEnabled: false,
  hapticsEnabled: true,
  reflectionPromptsEnabled: true,
};

const initialState: ChristianSessionState = {
  sessionId: null,
  mode: null,
  durationMinutes: 5,
  selectedVerse: null,
  audioSettings: defaultAudioSettings,
  reflectionDraft: {
    text: '',
    tags: [],
    voiceUri: null,
    silentTimerMinutes: null,
    updatedAtMs: null,
  },
  cameraPermission: 'undetermined',
  experienceMode: 'ar',
  arEngine: 'unavailable',
  arSupported: false,
  arInitialized: false,
  arPlacement: DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
  currentPhase: 'idle',
  phaseHistory: [],
  sessionStartedAtMs: null,
  sessionCompletedAtMs: null,
  currentRoute: null,
  isDraft: false,
  isInterrupted: false,
  isCompleted: false,
  completionSummary: null,
  lastErrorCode: null,
};

type ChristianSessionStore = ChristianSessionState & ChristianSessionActions;

function mergeTransform(
  current: PrayerCornerTransform,
  update: Partial<PrayerCornerTransform>,
): PrayerCornerTransform {
  return normalizePrayerCornerTransform(update, current);
}

export const useChristianSessionStore = create<ChristianSessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      createDraftSession: (mode) =>
        set((state) => {
          const draft = buildChristianDraftState(mode ?? state.mode);

          return {
            ...state,
            ...draft,
            durationMinutes: state.durationMinutes,
            experienceMode: 'ar',
            arEngine: 'unavailable',
            arInitialized: false,
            arPlacement: DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
            sessionStartedAtMs: null,
            sessionCompletedAtMs: null,
            currentRoute: null,
            isInterrupted: false,
            isCompleted: false,
            completionSummary: null,
            lastErrorCode: null,
            reflectionDraft: {
              ...state.reflectionDraft,
              text: '',
              tags: [],
              voiceUri: null,
              silentTimerMinutes: null,
              updatedAtMs: null,
            },
          };
        }),

      updateSetupSelections: ({ mode, durationMinutes, selectedVerse, audioSettings }) =>
        set((state) => {
          const nextMode = mode ?? state.mode;
          const nextSelectedVerse =
            selectedVerse ??
            (nextMode
              ? state.selectedVerse?.mode === nextMode || state.selectedVerse?.mode === 'universal'
                ? state.selectedVerse
                : getSuggestedChristianVerse(nextMode)
              : state.selectedVerse);

          return {
            ...state,
            mode: nextMode,
            durationMinutes: durationMinutes ?? state.durationMinutes,
            selectedVerse: nextSelectedVerse,
            audioSettings: {
              ...state.audioSettings,
              ...audioSettings,
            },
          };
        }),

      setCurrentRoute: (route) => set(() => ({ currentRoute: route })),

      setCameraPermission: (status) => set(() => ({ cameraPermission: status })),

      setExperienceMode: (mode) => set(() => ({ experienceMode: mode })),

      setArSupport: (supported) =>
        set((state) => ({
          arSupported: supported,
          lastErrorCode: supported ? state.lastErrorCode : 'arUnsupported',
        })),

      initializeArEngine: (engine) =>
        set(() => ({
          arEngine: engine,
          arInitialized: engine !== 'unavailable',
          arSupported: engine !== 'unavailable',
          lastErrorCode: engine === 'unavailable' ? 'arUnsupported' : null,
        })),

      setArPlacementState: (state) =>
        set(() => ({
          arPlacement: state,
          lastErrorCode: state.errorCode,
        })),

      placePrayerCorner: (transform) =>
        set((state) => ({
          arPlacement: {
            ...state.arPlacement,
            status: 'placed',
            canPlace: true,
            isPlaced: true,
            trackingQuality: 'good',
            transform: mergeTransform(state.arPlacement.transform, transform ?? {}),
            guidance: 'Prayer corner placed and ready for a quiet transition.',
            updatedAtMs: Date.now(),
            errorCode: null,
          },
        })),

      updatePrayerCorner: (transform) =>
        set((state) => ({
          arPlacement: {
            ...state.arPlacement,
            transform: mergeTransform(state.arPlacement.transform, transform),
            updatedAtMs: Date.now(),
          },
        })),

      setCurrentPhase: (phase) =>
        set((state) => ({
          currentPhase: phase,
          phaseHistory:
            state.phaseHistory[state.phaseHistory.length - 1] === phase
              ? state.phaseHistory
              : [...state.phaseHistory, phase],
        })),

      advancePrayerPhase: () =>
        set((state) => {
          const nextPhase = getChristianNextPhase(state.currentPhase as ChristianPrayerPhase);

          return {
            currentPhase: nextPhase,
            phaseHistory:
              state.phaseHistory[state.phaseHistory.length - 1] === nextPhase
                ? state.phaseHistory
                : [...state.phaseHistory, nextPhase],
          };
        }),

      saveReflectionDraft: (update) =>
        set((state) => ({
          reflectionDraft: {
            ...state.reflectionDraft,
            ...update,
            updatedAtMs: Date.now(),
          },
        })),

      markSessionStarted: (phase) =>
        set((state) => ({
          sessionStartedAtMs: state.sessionStartedAtMs ?? Date.now(),
          isDraft: false,
          isInterrupted: false,
          currentPhase:
            phase ?? (state.currentPhase === 'idle' ? 'openingStillness' : state.currentPhase),
          phaseHistory:
            phase && state.phaseHistory[state.phaseHistory.length - 1] !== phase
              ? [...state.phaseHistory, phase]
              : state.phaseHistory,
        })),

      completeSession: (summary) =>
        set(() => ({
          sessionCompletedAtMs: summary.completedAtMs,
          currentPhase: 'complete',
          isCompleted: true,
          isDraft: false,
          isInterrupted: false,
          completionSummary: summary,
          lastErrorCode: null,
        })),

      abandonSession: (errorCode) =>
        set(() => ({
          isInterrupted: true,
          lastErrorCode: errorCode ?? 'sessionInterrupted',
        })),

      resumeSession: () =>
        set(() => ({
          isInterrupted: false,
          lastErrorCode: null,
        })),

      resetSession: () =>
        set((state) => ({
          ...initialState,
          audioSettings: state.audioSettings,
        })),
    }),
    {
      name: 'christian-session-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
