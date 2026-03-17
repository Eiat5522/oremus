import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';

import IslamPrayerSessionScreen from '@/app/tradition/islam-session';
import { loadIslamicSessionAnalyticsEvents } from '@/lib/islamic-session-analytics';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockAddSessionLogEntry = jest.fn().mockResolvedValue(undefined);

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
}));
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({
    prayerName: 'isha',
    sessionId: 'session-2',
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock('@/components/islam/session/prayer-halo-anchor', () => ({
  PrayerHaloAnchor: () => {
    const ReactActual = jest.requireActual('react');
    const ReactNative = jest.requireActual('react-native');
    return ReactActual.createElement(ReactNative.View, { testID: 'halo-anchor' });
  },
}));
jest.mock('@/components/islam/session/prayer-session-background', () => ({
  PrayerSessionBackground: ({ children }: { children: React.ReactNode }) => {
    const ReactActual = jest.requireActual('react');
    const ReactNative = jest.requireActual('react-native');
    return ReactActual.createElement(ReactNative.View, undefined, children);
  },
}));
jest.mock('@/components/islam/session/prayer-session-timer', () => ({
  PrayerSessionTimer: () => {
    const ReactActual = jest.requireActual('react');
    const ReactNative = jest.requireActual('react-native');
    return ReactActual.createElement(ReactNative.Text, undefined, '00:00');
  },
}));
jest.mock('@/components/islam/session/prayer-session-controls', () => ({
  PrayerSessionControls: ({
    onEndSession,
    onEmergencyExit,
  }: {
    onEndSession: () => void;
    onEmergencyExit: () => void;
  }) => {
    const ReactActual = jest.requireActual('react');
    const ReactNative = jest.requireActual('react-native');
    return ReactActual.createElement(
      ReactNative.View,
      undefined,
      ReactActual.createElement(
        ReactNative.Pressable,
        { onPress: onEndSession },
        ReactActual.createElement(ReactNative.Text, undefined, 'End Session'),
      ),
      ReactActual.createElement(
        ReactNative.Pressable,
        { onPress: onEmergencyExit },
        ReactActual.createElement(ReactNative.Text, undefined, 'Exit'),
      ),
    );
  },
}));
jest.mock('@/hooks/use-prayer-session-visibility-controls', () => ({
  usePrayerSessionVisibilityControls: () => ({
    controlsOpacity: { value: 1 },
    reveal: jest.fn(),
  }),
}));
jest.mock('@/lib/session-log', () => ({
  addSessionLogEntry: (...args: unknown[]) => mockAddSessionLogEntry(...args),
}));

describe('IslamPrayerSessionScreen analytics', () => {
  beforeAll(() => {
    const createAnimation = () => ({
      start: (callback?: () => void) => {
        callback?.();
      },
    });

    jest.spyOn(Animated, 'timing').mockImplementation(() => createAnimation() as never);
    jest.spyOn(Animated, 'delay').mockImplementation(() => createAnimation() as never);
    jest.spyOn(Animated, 'parallel').mockImplementation(() => createAnimation() as never);
    jest.spyOn(Animated, 'sequence').mockImplementation(() => createAnimation() as never);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('tracks a completed session before navigating to completion', async () => {
    const { getByText } = render(<IslamPrayerSessionScreen />);

    fireEvent.press(getByText('End Session'));

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      expect(events.map((event) => event.type)).toEqual(['session_completed']);
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/tradition/islam-completion',
      params: expect.objectContaining({
        prayerName: 'isha',
        sessionId: 'session-2',
      }),
    });
  });

  it('tracks early exits without logging a completed session', async () => {
    const { getByText } = render(<IslamPrayerSessionScreen />);

    fireEvent.press(getByText('Exit'));

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      expect(events.map((event) => event.type)).toEqual(['session_exited_early']);
    });

    expect(mockAddSessionLogEntry).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });
});
