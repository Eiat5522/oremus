import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import QiblaScreen from '@/app/(tabs)/qibla';
import { loadIslamicSessionAnalyticsEvents } from '@/lib/islamic-session-analytics';

const mockPush = jest.fn();

type CameraPermissionState = {
  canAskAgain: boolean;
  expires: 'never';
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined';
};

let mockCameraPermissionState: CameraPermissionState;
let mockNextCameraPermissionState: CameraPermissionState;
const mockRequestCameraPermission = jest.fn(async () => {
  mockCameraPermissionState = mockNextCameraPermissionState;
  return mockNextCameraPermissionState;
});

type QiblaAlignmentMockState = {
  alignmentOffset: number | null;
  signedOffset: number | null;
  alignmentState: 'notAligned' | 'nearAligned' | 'aligned';
  manualHeadingOffset: number;
  locationError: string | null;
  locationPermissionStatus: 'granted' | 'denied' | null;
  canAskLocationPermission: boolean;
  isRequestingLocationPermission: boolean;
  requestLocationPermission: jest.Mock;
  recenter: jest.Mock;
  nudgeCalibration: jest.Mock;
};

let mockQiblaAlignmentState: QiblaAlignmentMockState;

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({
    mode: 'session',
    prayerName: 'fajr',
    sessionId: 'session-1',
  }),
}));
jest.mock('@/components/qibla/qibla-compass-page', () => ({
  QiblaCompassPage: () => null,
}));
jest.mock('@/hooks/use-safe-camera-permissions', () => ({
  useSafeCameraPermissions: () => {
    const ReactActual = jest.requireActual('react');
    const [permission, setPermission] = ReactActual.useState(mockCameraPermissionState);

    const requestPermission = ReactActual.useCallback(async () => {
      const nextPermission = await mockRequestCameraPermission();
      setPermission(nextPermission);
      return nextPermission;
    }, []);

    return [permission, requestPermission] as const;
  },
}));
jest.mock('@/hooks/use-qibla-alignment', () => ({
  useQiblaAlignment: () => mockQiblaAlignmentState,
}));

function expectOrderedSubset(received: string[], expected: string[]) {
  let currentIndex = -1;
  expected.forEach((eventType) => {
    const nextIndex = received.indexOf(eventType, currentIndex + 1);
    expect(nextIndex).toBeGreaterThan(currentIndex);
    currentIndex = nextIndex;
  });
}

describe('QiblaScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
    mockCameraPermissionState = {
      status: 'undetermined',
      canAskAgain: true,
      granted: false,
      expires: 'never',
    };
    mockNextCameraPermissionState = {
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    };
    mockQiblaAlignmentState = {
      alignmentOffset: 3.1,
      signedOffset: 3.1,
      alignmentState: 'aligned',
      manualHeadingOffset: 0,
      locationError: null,
      locationPermissionStatus: 'granted',
      canAskLocationPermission: true,
      isRequestingLocationPermission: false,
      requestLocationPermission: jest.fn(),
      recenter: jest.fn(),
      nudgeCalibration: jest.fn(),
    };
  });

  it('records the happy-path event sequence through qibla alignment', async () => {
    render(<QiblaScreen />);

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const eventTypes = events.map((event) => event.type);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'camera_permission_prompted']);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'location_permission_prompted']);
      expect(eventTypes).toContain('camera_permission_granted');
      expect(eventTypes).toContain('location_permission_granted');
      expect(eventTypes).toContain('alignment_reached');
      expect(eventTypes).toContain('auto_start_triggered');
    });
  });

  it('records blocked permission outcomes for a denied path', async () => {
    mockNextCameraPermissionState = {
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    };
    mockQiblaAlignmentState = {
      ...mockQiblaAlignmentState,
      alignmentOffset: null,
      signedOffset: null,
      alignmentState: 'notAligned',
      locationPermissionStatus: 'denied',
      canAskLocationPermission: false,
      locationError: 'Location access is blocked. Enable it in settings to continue.',
    };

    render(<QiblaScreen />);

    await waitFor(async () => {
      const eventTypes = (await loadIslamicSessionAnalyticsEvents()).map((event) => event.type);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'camera_permission_prompted']);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'location_permission_prompted']);
      expect(eventTypes).toContain('camera_permission_blocked');
      expect(eventTypes).toContain('location_permission_blocked');
    });
  });
});
