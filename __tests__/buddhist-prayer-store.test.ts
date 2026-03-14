import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

jest.mock('@react-native-async-storage/async-storage', () => AsyncStorageMock);

describe('buddhist prayer store', () => {
  beforeEach(() => {
    useBuddhistPrayerStore.getState().resetSession();
  });

  it('tracks dedication notes and clears them on reset', () => {
    useBuddhistPrayerStore.getState().setDedicationNote('For peace and healing');
    expect(useBuddhistPrayerStore.getState().dedicationNote).toBe('For peace and healing');

    useBuddhistPrayerStore.getState().resetSession();
    expect(useBuddhistPrayerStore.getState().dedicationNote).toBe('');
  });

  it('keeps chant progress available for interrupted sessions and marks completion', () => {
    const store = useBuddhistPrayerStore.getState();

    store.startPreparation('namo-tassa');
    store.startSession();
    store.nextVerse(3);
    store.nextVerse(3);

    expect(useBuddhistPrayerStore.getState().currentChantSlug).toBe('namo-tassa');
    expect(useBuddhistPrayerStore.getState().currentVerseIndex).toBe(2);
    expect(useBuddhistPrayerStore.getState().sessionStartedAt).not.toBeNull();
    expect(useBuddhistPrayerStore.getState().sessionCompletedAt).toBeNull();

    useBuddhistPrayerStore.getState().completeSession();
    expect(useBuddhistPrayerStore.getState().sessionCompletedAt).not.toBeNull();
  });

  it('keeps altar mode and transform available through the AR flow until session reset', () => {
    const store = useBuddhistPrayerStore.getState();

    store.setAltarExperienceMode('nativeARReady');
    store.startScan();
    store.surfaceDetected();
    store.updatePlacementScale(1.6);
    store.updatePlacementRotation(-15);
    store.placeAltar();
    store.startPreparation('namo-tassa', true);
    store.startSession();
    store.completeSession();

    const state = useBuddhistPrayerStore.getState();
    expect(state.altarExperienceMode).toBe('nativeARReady');
    expect(state.altarPlaced).toBe(true);
    expect(state.scanStatus).toBe('placed');
    expect(state.placementScale).toBe(1.6);
    expect(state.placementRotation).toBe(345);
    expect(state.currentChantId).toBe('namo-tassa');
    expect(state.isARMode).toBe(true);

    state.resetSession();
    expect(useBuddhistPrayerStore.getState().altarExperienceMode).toBe('immersive3D');
    expect(useBuddhistPrayerStore.getState().placementScale).toBe(1);
    expect(useBuddhistPrayerStore.getState().placementRotation).toBe(0);
  });

  it('clears confirmed placement state when placement is reset for a new scan', () => {
    const store = useBuddhistPrayerStore.getState();

    store.startScan();
    store.surfaceDetected();
    store.updatePlacementScale(2.2);
    store.updatePlacementRotation(60);
    store.placeAltar();

    store.resetPlacement();

    const state = useBuddhistPrayerStore.getState();
    expect(state.altarPlaced).toBe(false);
    expect(state.scanStatus).toBe('idle');
    expect(state.placementScale).toBe(1);
    expect(state.placementRotation).toBe(0);
  });
});
