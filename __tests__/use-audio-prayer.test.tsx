jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, renderHook } from '@testing-library/react-native';

import { useAudioPrayer } from '@/hooks/use-audio-prayer';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

const mockChantPlay = jest.fn();
const mockChantPause = jest.fn();
const mockChantSeekTo = jest.fn();
const mockBellPlay = jest.fn();
const mockBellPause = jest.fn();
const mockBellSeekTo = jest.fn();

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest
    .fn()
    .mockImplementationOnce(() => ({
      play: mockChantPlay,
      pause: mockChantPause,
      seekTo: mockChantSeekTo,
    }))
    .mockImplementationOnce(() => ({
      play: mockBellPlay,
      pause: mockBellPause,
      seekTo: mockBellSeekTo,
    })),
  useAudioPlayerStatus: jest
    .fn()
    .mockReturnValueOnce({
      playing: false,
      currentTime: 0,
      duration: 10,
    })
    .mockReturnValueOnce({
      playing: false,
      currentTime: 0,
      duration: 1,
    }),
}));

describe('useAudioPrayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBuddhistPrayerStore.getState().resetSession();
  });

  it('plays the temple bell when bell audio is enabled even if monk chanting is off', async () => {
    const store = useBuddhistPrayerStore.getState();
    if (store.templeBellEnabled) {
      store.toggleTempleBell();
    }
    if (store.isAudioEnabled) {
      store.toggleAudio();
    }

    store.toggleTempleBell();

    const { result } = renderHook(() => useAudioPrayer());

    await act(async () => {
      await result.current.playTempleBell();
    });

    expect(mockBellPlay).toHaveBeenCalledTimes(1);
    expect(mockChantPlay).not.toHaveBeenCalled();
  });
});
