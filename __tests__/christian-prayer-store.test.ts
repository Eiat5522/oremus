import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import { useChristianPrayerStore } from '@/hooks/use-christian-prayer-store';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('christian prayer store', () => {
  beforeEach(() => {
    useChristianPrayerStore.getState().clearSessionHistory();
  });

  it('tracks lifecycle transitions through a prayer session', () => {
    const store = useChristianPrayerStore.getState();

    store.startPreparation('peace-in-christ');
    store.startSession();
    store.nextStage(5);
    store.pauseSession();
    store.resumeSession();

    let state = useChristianPrayerStore.getState();
    expect(state.selectedTemplateId).toBe('peace-in-christ');
    expect(state.currentStageIndex).toBe(1);
    expect(state.isPlaying).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.sessionStartedAt).not.toBeNull();
    expect(state.sessionCompletedAt).toBeNull();

    store.completeSession();

    state = useChristianPrayerStore.getState();
    expect(state.sessionCompletedAt).not.toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.isPaused).toBe(false);
  });

  it('preserves preferences when resetting session progress', () => {
    const store = useChristianPrayerStore.getState();

    store.setAutoAdvance(false);
    store.setAmbientAudioEnabled(true);
    store.setShowScriptureFirst(false);
    store.startPreparation('seeking-guidance');
    store.startSession();
    store.nextStage(5);

    store.resetSession();

    const state = useChristianPrayerStore.getState();
    expect(state.selectedTemplateId).toBeNull();
    expect(state.currentStageIndex).toBe(0);
    expect(state.autoAdvance).toBe(false);
    expect(state.ambientAudioEnabled).toBe(true);
    expect(state.showScriptureFirst).toBe(false);
  });

  it('increments the replay token when replaying the same stage', () => {
    const store = useChristianPrayerStore.getState();

    store.startPreparation('rest-for-the-weary');
    const initialToken = useChristianPrayerStore.getState().stageReplayToken;

    store.replayStage();

    expect(useChristianPrayerStore.getState().stageReplayToken).toBe(initialToken + 1);
  });
});
