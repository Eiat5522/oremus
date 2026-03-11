import AsyncStorage from '@react-native-async-storage/async-storage';

import { FOCUS_GATE_STORAGE_KEY, lockFocusGateNow } from '@/lib/focus-gate';
import { triggerFocusGateBlockNow } from '@/lib/focus-gate-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@/lib/focus-gate-native', () => ({
  syncFocusGateNative: jest.fn().mockResolvedValue(true),
  triggerFocusGateBlockNow: jest.fn().mockResolvedValue(true),
}));

const asyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const triggerBlockNow = triggerFocusGateBlockNow as jest.MockedFunction<
  typeof triggerFocusGateBlockNow
>;

describe('focus gate immediate lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enables blocking, clears the unlock window, and opens the blocker preview', async () => {
    asyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        enabled: false,
        unlockWindowMinutes: 30,
        blockedPackages: ['com.instagram.android'],
        tradition: 'islam',
        unlockUntilMs: Date.now() + 30 * 60 * 1000,
        lastPrayerCompletedAtMs: 12345,
      }),
    );

    const next = await lockFocusGateNow('com.instagram.android', 'Instagram');

    expect(next.enabled).toBe(true);
    expect(next.unlockUntilMs).toBeNull();
    expect(asyncStorage.setItem).toHaveBeenCalledWith(
      FOCUS_GATE_STORAGE_KEY,
      expect.stringContaining('"unlockUntilMs":null'),
    );
    expect(triggerBlockNow).toHaveBeenCalledWith('com.instagram.android', 'Instagram');
  });
});
