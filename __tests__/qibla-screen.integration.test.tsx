import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';

import QiblaScreen from '@/app/(tabs)/qibla';

type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

type MockCameraPermission = {
  status: CameraPermissionStatus;
  canAskAgain: boolean;
  expires: 'never';
  granted: boolean;
};

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockRequestCameraPermission = jest.fn();
const mockRequestLocationPermission = jest.fn();
const mockRecenter = jest.fn();
const mockNudgeCalibration = jest.fn();
const mockQiblaPropsSpy = jest.fn();

const mockRouteParams: { mode?: string; prayerName?: string } = {
  mode: 'finder',
  prayerName: 'fajr',
};

const mockCameraPermissionRef: { current: MockCameraPermission | null } = {
  current: {
    status: 'granted',
    canAskAgain: true,
    expires: 'never',
    granted: true,
  },
};

const mockAlignmentRef: {
  current: {
    alignmentOffset: number | null;
    signedOffset: number | null;
    alignmentState: 'notAligned' | 'nearAligned' | 'aligned';
    manualHeadingOffset: number;
    locationError: string | null;
    canAskLocationPermission: boolean;
    isRequestingLocationPermission: boolean;
  };
} = {
  current: {
    alignmentOffset: 22,
    signedOffset: 22,
    alignmentState: 'notAligned',
    manualHeadingOffset: 0,
    locationError: null,
    canAskLocationPermission: true,
    isRequestingLocationPermission: false,
  },
};

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  useLocalSearchParams: () => mockRouteParams,
}));

jest.mock('@/hooks/use-safe-camera-permissions', () => ({
  useSafeCameraPermissions: () => [mockCameraPermissionRef.current, mockRequestCameraPermission],
}));

jest.mock('@/hooks/use-qibla-alignment', () => ({
  useQiblaAlignment: () => ({
    ...mockAlignmentRef.current,
    requestLocationPermission: mockRequestLocationPermission,
    recenter: mockRecenter,
    nudgeCalibration: mockNudgeCalibration,
  }),
}));

jest.mock('@/components/qibla/qibla-compass-page', () => ({
  QiblaCompassPage: (props: Record<string, unknown>) => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    mockQiblaPropsSpy(props);
    return (
      <View>
        <Text testID="camera-status">{String(props.cameraPermissionStatus)}</Text>
        <Text testID="can-ask-camera">{String(props.canAskCameraPermission)}</Text>
        <Text testID="show-live-camera">{String(props.showLiveCamera)}</Text>
        <Pressable
          testID="start-now"
          onPress={() => (props.onStartPrayerNow as () => void)()}
        />
        <Pressable
          testID="request-camera"
          onPress={() => (props.onRequestCameraPermission as () => void)()}
        />
        <Pressable
          testID="open-camera-settings"
          onPress={() => (props.onOpenCameraSettings as () => void)()}
        />
      </View>
    );
  },
}));

describe('QiblaScreen integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRouteParams.mode = 'finder';
    mockRouteParams.prayerName = 'fajr';
    mockCameraPermissionRef.current = {
      status: 'granted',
      canAskAgain: true,
      expires: 'never',
      granted: true,
    };
    mockAlignmentRef.current = {
      alignmentOffset: 22,
      signedOffset: 22,
      alignmentState: 'notAligned',
      manualHeadingOffset: 0,
      locationError: null,
      canAskLocationPermission: true,
      isRequestingLocationPermission: false,
    };
    mockRequestCameraPermission.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      expires: 'never',
      granted: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('passes denied camera permission state (recoverable) to the qibla view model', () => {
    mockCameraPermissionRef.current = {
      status: 'denied',
      canAskAgain: true,
      expires: 'never',
      granted: false,
    };

    const { getByTestId } = render(<QiblaScreen />);

    expect(getByTestId('camera-status').props.children).toBe('denied');
    expect(getByTestId('can-ask-camera').props.children).toBe('true');
    expect(getByTestId('show-live-camera').props.children).toBe('false');
  });

  it('passes blocked camera permission state and opens settings via callback', async () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    mockCameraPermissionRef.current = {
      status: 'denied',
      canAskAgain: false,
      expires: 'never',
      granted: false,
    };

    const { getByTestId } = render(<QiblaScreen />);

    expect(getByTestId('can-ask-camera').props.children).toBe('false');
    fireEvent.press(getByTestId('open-camera-settings'));
    expect(openSettingsSpy).toHaveBeenCalledTimes(1);
  });

  it('auto-requests camera permission when status is undetermined', () => {
    mockCameraPermissionRef.current = {
      status: 'undetermined',
      canAskAgain: true,
      expires: 'never',
      granted: false,
    };

    render(<QiblaScreen />);

    expect(mockRequestCameraPermission).toHaveBeenCalledTimes(1);
  });

  it('auto-opens islam session after sustained alignment in session mode', () => {
    mockRouteParams.mode = 'session';
    mockRouteParams.prayerName = 'isha';

    const { rerender } = render(<QiblaScreen />);
    expect(mockPush).not.toHaveBeenCalled();

    mockAlignmentRef.current.alignmentState = 'aligned';
    mockAlignmentRef.current.alignmentOffset = 0;
    mockAlignmentRef.current.signedOffset = 0;
    rerender(<QiblaScreen />);

    jest.advanceTimersByTime(899);
    expect(mockPush).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/tradition/islam-session',
      params: { prayerName: 'isha' },
    });
  });

  it('does not auto-open when alignment jitters back before timeout elapses', () => {
    mockRouteParams.mode = 'session';
    mockRouteParams.prayerName = 'dhuhr';

    const { rerender } = render(<QiblaScreen />);

    mockAlignmentRef.current.alignmentState = 'aligned';
    mockAlignmentRef.current.alignmentOffset = 0;
    mockAlignmentRef.current.signedOffset = 0;
    rerender(<QiblaScreen />);

    jest.advanceTimersByTime(450);

    mockAlignmentRef.current.alignmentState = 'notAligned';
    mockAlignmentRef.current.alignmentOffset = 9;
    mockAlignmentRef.current.signedOffset = 9;
    rerender(<QiblaScreen />);

    jest.advanceTimersByTime(1000);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('allows manual start-now to open islam session immediately', () => {
    mockRouteParams.mode = 'session';
    mockRouteParams.prayerName = 'asr';

    const { getByTestId } = render(<QiblaScreen />);
    fireEvent.press(getByTestId('start-now'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/tradition/islam-session',
      params: { prayerName: 'asr' },
    });
  });
});
