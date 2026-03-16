import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import { useChristianPrayerStore } from '@/hooks/use-christian-prayer-store';
import { buildChristianSessionSummary } from '@/features/christian-prayer/services/christianSession.service';
import { getChristianModeContent } from '@/features/christian-prayer/services/christianContent.service';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('christian prayer store', () => {
  beforeEach(() => {
    useChristianPrayerStore.getState().resetSession();
  });

  it('creates a draft, updates setup selections, and tracks AR placement state', () => {
    const store = useChristianPrayerStore.getState();

    store.createDraftSession('peace');
    store.updateSetupSelections({
      durationMinutes: 10,
      audioSettings: {
        ambientEnabled: true,
        narrationEnabled: false,
      },
    });
    store.initializeArEngine('mock');
    store.placePrayerCorner({ rotation: 24, scale: 1.12 });

    const state = useChristianPrayerStore.getState();

    expect(state.mode).toBe('peace');
    expect(state.durationMinutes).toBe(10);
    expect(state.audioSettings.ambientEnabled).toBe(true);
    expect(state.audioSettings.narrationEnabled).toBe(false);
    expect(state.arEngine).toBe('mock');
    expect(state.arInitialized).toBe(true);
    expect(state.arPlacement.isPlaced).toBe(true);
    expect(state.arPlacement.transform.rotation).toBe(24);
    expect(state.arPlacement.transform.scale).toBe(1.12);
  });

  it('advances phases, saves reflection state, and marks interruptions', () => {
    const store = useChristianPrayerStore.getState();

    store.createDraftSession('gratitude');
    store.markSessionStarted('openingStillness');
    store.advancePrayerPhase();
    store.advancePrayerPhase();
    store.saveReflectionDraft({
      text: 'I noticed grace in ordinary things.',
      tags: ['gratitude', 'peace'],
      silentTimerMinutes: 2,
    });
    store.abandonSession('sessionInterrupted');
    store.resumeSession();

    const state = useChristianPrayerStore.getState();

    expect(state.currentPhase).toBe('reflection');
    expect(state.phaseHistory).toEqual(['openingStillness', 'scripture', 'reflection']);
    expect(state.reflectionDraft.text).toContain('grace');
    expect(state.reflectionDraft.tags).toEqual(['gratitude', 'peace']);
    expect(state.reflectionDraft.silentTimerMinutes).toBe(2);
    expect(state.isInterrupted).toBe(false);
    expect(state.lastErrorCode).toBeNull();
  });

  it('completes and resets while preserving user preferences', () => {
    const store = useChristianPrayerStore.getState();
    const modeContent = getChristianModeContent('guidedPrayer');

    store.createDraftSession('guidedPrayer');
    store.updateSetupSelections({
      audioSettings: {
        ambientEnabled: true,
        reflectionPromptsEnabled: false,
      },
    });
    store.markSessionStarted('openingStillness');

    const startedAtMs = useChristianPrayerStore.getState().sessionStartedAtMs ?? Date.now();
    const summary = buildChristianSessionSummary({
      sessionId: useChristianPrayerStore.getState().sessionId ?? 'missing',
      mode: 'guidedPrayer',
      title: modeContent.title,
      verse: modeContent.heroVerse,
      durationMinutes: 5,
      startedAtMs,
      completedAtMs: startedAtMs + 90_000,
      reflectionPreview: 'A short reflection',
    });

    store.completeSession(summary);
    let state = useChristianPrayerStore.getState();
    expect(state.isCompleted).toBe(true);
    expect(state.completionSummary?.title).toBe(modeContent.title);
    expect(state.currentPhase).toBe('complete');

    store.resetSession();
    state = useChristianPrayerStore.getState();

    expect(state.mode).toBeNull();
    expect(state.isCompleted).toBe(false);
    expect(state.audioSettings.ambientEnabled).toBe(true);
    expect(state.audioSettings.reflectionPromptsEnabled).toBe(false);
  });
});
