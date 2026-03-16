import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import {
  getDefaultCompletionState,
  markPrayerComplete,
  PRAYER_COMPLETION_STORAGE_KEY,
} from '@/lib/islam-prayer-completion';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('islam prayer completion', () => {
  beforeEach(async () => {
    await mockAsyncStorage.clear();
  });

  it('marks the requested prayer complete for the active day', async () => {
    const date = new Date('2026-03-16T10:15:00.000Z');

    await markPrayerComplete('isha', date);

    const stored = await mockAsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({
      '2026-03-16': {
        ...getDefaultCompletionState(),
        isha: true,
      },
    });
  });

  it('preserves other prayer completion flags for the same day', async () => {
    const date = new Date('2026-03-16T10:15:00.000Z');
    await mockAsyncStorage.setItem(
      PRAYER_COMPLETION_STORAGE_KEY,
      JSON.stringify({
        '2026-03-16': {
          ...getDefaultCompletionState(),
          fajr: true,
        },
      }),
    );

    await markPrayerComplete('isha', date);

    const stored = await mockAsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
    expect(JSON.parse(stored!)).toEqual({
      '2026-03-16': {
        ...getDefaultCompletionState(),
        fajr: true,
        isha: true,
      },
    });
  });

  it('serializes concurrent completion writes so no prayer flags are lost', async () => {
    const date = new Date('2026-03-16T10:15:00.000Z');

    await Promise.all([markPrayerComplete('fajr', date), markPrayerComplete('isha', date)]);

    const stored = await mockAsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
    expect(JSON.parse(stored!)).toEqual({
      '2026-03-16': {
        ...getDefaultCompletionState(),
        fajr: true,
        isha: true,
      },
    });
  });
});
