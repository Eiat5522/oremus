jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

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
});
