import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ChristianFallbackStartScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
  }),
  useAudioPlayerStatus: () => ({
    playing: false,
    currentTime: 0,
    duration: 10,
  }),
}));
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-camera', () => ({
  CameraView: () => null,
}));
jest.mock('expo-three', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('expo-image', () => ({
  Image: (props: object) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: object) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: (props: object) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
  Circle: (props: object) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

describe('ChristianFallbackStartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChristianSessionStore.getState().resetSession();
    useChristianSessionStore.getState().createDraftSession('peace');
  });

  it('renders the fallback sanctuary and starts the prayer flow', () => {
    const { getByText } = render(<ChristianFallbackStartScreen />);

    expect(getByText('2D Sanctuary')).toBeTruthy();

    fireEvent.press(getByText('Begin Prayer Session'));

    expect(useChristianSessionStore.getState().experienceMode).toBe('fallback2d');
    expect(useChristianSessionStore.getState().currentPhase).toBe('openingStillness');
    expect(mockReplace).toHaveBeenCalledWith('/christian-2d/stillness');
  });
});
