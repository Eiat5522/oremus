import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';

import IslamPrayerSessionScreen from '@/app/tradition/islam-session';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockAddSessionLogEntry = jest.fn().mockResolvedValue([]);

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
    prayerName: 'asr',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    View: require('react-native').View,
  },
  useAnimatedStyle: (updater: () => object) => updater(),
}));

jest.mock('@/hooks/use-prayer-session-visibility-controls', () => ({
  usePrayerSessionVisibilityControls: () => ({
    controlsOpacity: { value: 1 },
    reveal: jest.fn(),
  }),
}));

jest.mock('@/components/islam/session/prayer-session-background', () => ({
  PrayerSessionBackground: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/components/islam/session/prayer-halo-anchor', () => ({
  PrayerHaloAnchor: () => {
    const React = require('react');
    const { View } = require('react-native');
    return <View testID="halo-anchor" />;
  },
}));

jest.mock('@/components/islam/session/prayer-session-timer', () => ({
  PrayerSessionTimer: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>00:00</Text>;
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
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Pressable onPress={onEndSession}>
          <Text>End Session</Text>
        </Pressable>
        <Pressable onPress={onEmergencyExit}>
          <Text>Exit</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/lib/session-log', () => ({
  addSessionLogEntry: (...args: unknown[]) => mockAddSessionLogEntry(...args),
}));

describe('IslamPrayerSessionScreen integration', () => {
  let timingSpy: jest.SpyInstance;
  let sequenceSpy: jest.SpyInstance;
  let parallelSpy: jest.SpyInstance;
  let delaySpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    const immediateAnimation = {
      start: (cb?: () => void) => {
        if (cb) cb();
      },
    };
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue(immediateAnimation as never);
    sequenceSpy = jest.spyOn(Animated, 'sequence').mockReturnValue(immediateAnimation as never);
    parallelSpy = jest.spyOn(Animated, 'parallel').mockReturnValue(immediateAnimation as never);
    delaySpy = jest.spyOn(Animated, 'delay').mockReturnValue(immediateAnimation as never);
  });

  afterEach(() => {
    timingSpy.mockRestore();
    sequenceSpy.mockRestore();
    parallelSpy.mockRestore();
    delaySpy.mockRestore();
  });

  it('ends session with logging and completion navigation payload', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const { getByText } = render(<IslamPrayerSessionScreen />);

    fireEvent.press(getByText('End Session'));

    expect(mockAddSessionLogEntry).toHaveBeenCalledWith({
      tradition: 'islam',
      prayerName: 'asr',
      startedAtMs: 1_700_000_000_000,
      completedAtMs: 1_700_000_000_000,
      durationSeconds: 0,
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/tradition/islam-completion',
      params: {
        prayerName: 'asr',
        durationSeconds: '0',
      },
    });

    nowSpy.mockRestore();
  });

  it('supports emergency exit back navigation', () => {
    const { getByText } = render(<IslamPrayerSessionScreen />);

    fireEvent.press(getByText('Exit'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
