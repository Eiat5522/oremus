import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ChristianArPlaceScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';
import type { ArPlacementState } from '@/features/christian-prayer/constants';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

const mockPlacedState: ArPlacementState = {
  status: 'placed',
  canPlace: true,
  isPlaced: true,
  trackingQuality: 'good',
  transform: {
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
    z: 0,
  },
  guidance: 'Prayer corner placed. Fine-tune it until it feels still and grounded.',
  retryCount: 0,
  updatedAtMs: Date.now(),
  errorCode: null,
};

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
jest.mock('@/features/christian-prayer/components', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  const passthrough =
    () =>
    ({ children }: { children?: React.ReactNode }) =>
      <View>{children}</View>;
  const button =
    () =>
    ({
      label,
      onPress,
      children,
    }: {
      label?: string;
      onPress?: () => void;
      children?: React.ReactNode;
    }) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {label ? <Text>{label}</Text> : null}
        {children}
      </Pressable>
    );

  return {
    ArIntroIllustration: passthrough(),
    BlessingCard: passthrough(),
    BottomSheetContainer: passthrough(),
    ChristianArViewport: () => <View testID="christian-ar-viewport" />,
    ChristianFlowScreen: passthrough(),
    ChristianSessionHero: passthrough(),
    CompletionSummaryCard: passthrough(),
    CountdownRing: passthrough(),
    DurationChipGroup: passthrough(),
    FloatingConfirmationCard: passthrough(),
    FloatingScriptureCard: passthrough(),
    GlassCard: passthrough(),
    IconCircleButton: button(),
    PrayerCornerScene: passthrough(),
    PrayerPhaseCard: passthrough(),
    PrayerStepper: passthrough(),
    PrimaryButton: button(),
    ReflectionEditor: passthrough(),
    ReflectionPromptCard: passthrough(),
    SecondaryButton: button(),
    SelectedModeCard: passthrough(),
    SessionModeList: passthrough(),
    StillnessOverlay: passthrough(),
    ToggleRow: passthrough(),
    TopOverlayHeader: ({ title }: { title: string }) => <Text>{title}</Text>,
    VersePreviewCard: passthrough(),
  };
});
jest.mock('@/features/christian-prayer/hooks/useChristianArController', () => ({
  useChristianArController: () => ({
    arPlacement: mockPlacedState,
    placePrayerCorner: jest.fn().mockResolvedValue(mockPlacedState),
    resetPlacement: jest.fn(),
    updatePrayerCorner: jest.fn(),
  }),
}));

describe('ChristianArPlaceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChristianSessionStore.getState().resetSession();
    useChristianSessionStore.getState().createDraftSession('peace');
    useChristianSessionStore.getState().setCameraPermission('granted');
    useChristianSessionStore.getState().setArPlacementState(mockPlacedState);
  });

  it('navigates forward when placement is confirmed', () => {
    const { getByText } = render(<ChristianArPlaceScreen />);

    fireEvent.press(getByText('Confirm Placement'));

    expect(mockPush).toHaveBeenCalledWith('/christian/ar-ready');
  });
});
