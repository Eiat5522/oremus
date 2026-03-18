import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import QiblaScreen from '@/app/(tabs)/qibla';
import { loadIslamicSessionAnalyticsEvents } from '@/lib/islamic-session-analytics';

const mockPush = jest.fn();
const mockRefreshCameraPermission = jest.fn();
const mockRefreshLocationPermission = jest.fn();

type CameraPermissionState = {
  canAskAgain: boolean;
  expires: 'never';
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined';
};

let mockCameraPermissionState: CameraPermissionState;
let mockNextCameraPermissionState: CameraPermissionState;
let mockCameraPermissionMeta: {
  permissionFlowState: 'coldStart' | 'requesting' | 'granted' | 'deniedAskable' | 'blocked';
  permissionSyncSource: 'coldStart' | 'prompt' | 'settingsReturn';
  isRequestingPermission: boolean;
  lastPermissionFailure: { code: string; message: string; source: string } | null;
};
const mockRequestCameraPermission = jest.fn(async () => {
  mockCameraPermissionState = mockNextCameraPermissionState;
  mockCameraPermissionMeta = {
    ...mockCameraPermissionMeta,
    permissionFlowState:
      mockNextCameraPermissionState.status === 'granted'
        ? 'granted'
        : mockNextCameraPermissionState.canAskAgain
          ? 'deniedAskable'
          : 'blocked',
    permissionSyncSource: 'prompt',
  };
  return mockNextCameraPermissionState;
});

type QiblaAlignmentMockState = {
  alignmentOffset: number | null;
  signedOffset: number | null;
  alignmentState: 'notAligned' | 'nearAligned' | 'aligned';
  manualHeadingOffset: number;
  locationError: string | null;
  locationPermissionStatus: 'granted' | 'denied' | null;
  locationPermissionFlowState: 'coldStart' | 'requesting' | 'granted' | 'deniedAskable' | 'blocked';
  locationPermissionSyncSource: 'coldStart' | 'prompt' | 'settingsReturn';
  canAskLocationPermission: boolean;
  isRequestingLocationPermission: boolean;
  lastLocationPermissionFailure: { code: string; message: string; source: string } | null;
  requestLocationPermission: jest.Mock;
  refreshLocationPermission: jest.Mock;
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

    return [permission, requestPermission, mockRefreshCameraPermission, mockCameraPermissionMeta] as const;
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
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRefreshCameraPermission.mockResolvedValue(undefined);
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
    mockCameraPermissionMeta = {
      permissionFlowState: 'coldStart',
      permissionSyncSource: 'coldStart',
      isRequestingPermission: false,
      lastPermissionFailure: null,
    };
    mockQiblaAlignmentState = {
      alignmentOffset: 3.1,
      signedOffset: 3.1,
      alignmentState: 'aligned',
      manualHeadingOffset: 0,
      locationError: null,
      locationPermissionStatus: 'granted',
      locationPermissionFlowState: 'granted',
      locationPermissionSyncSource: 'coldStart',
      canAskLocationPermission: true,
      isRequestingLocationPermission: false,
      lastLocationPermissionFailure: null,
      requestLocationPermission: jest.fn(),
      refreshLocationPermission: mockRefreshLocationPermission,
      recenter: jest.fn(),
      nudgeCalibration: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('records the happy-path event sequence through qibla alignment', async () => {
    render(<QiblaScreen />);
    act(() => {
      jest.advanceTimersByTime(900);
    });

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const eventTypes = events.map((event) => event.type);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'camera_permission_prompted']);
      expectOrderedSubset(eventTypes, ['qibla_opened', 'location_permission_prompted']);
      expect(eventTypes).toContain('camera_permission_granted');
      expect(eventTypes).toContain('location_permission_granted');
      expect(eventTypes).toContain('alignment_reached');
      expect(eventTypes).toContain('alignment_stable_confirmed');
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

  it('records camera module load failures from the permission layer', async () => {
    mockCameraPermissionState = {
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    };
    mockCameraPermissionMeta = {
      permissionFlowState: 'blocked',
      permissionSyncSource: 'coldStart',
      isRequestingPermission: false,
      lastPermissionFailure: {
        code: 'camera_module_load_failed',
        message: 'Unable to load the camera module.',
        source: 'coldStart',
      },
    };
    mockQiblaAlignmentState = {
      ...mockQiblaAlignmentState,
      alignmentOffset: null,
      signedOffset: null,
      alignmentState: 'notAligned',
    };

    render(<QiblaScreen />);

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const failureEvent = events.find((event) => event.type === 'camera_module_load_failed');
      expect(failureEvent).toBeDefined();
      expect(failureEvent?.payload.permissionSyncSource).toBe('coldStart');
      expect(failureEvent?.payload.errorMessage).toBe('Unable to load the camera module.');
    });
  });

  it('records camera permission request failures with structured details', async () => {
    mockCameraPermissionState = {
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    };
    mockCameraPermissionMeta = {
      permissionFlowState: 'blocked',
      permissionSyncSource: 'prompt',
      isRequestingPermission: false,
      lastPermissionFailure: {
        code: 'camera_permission_request_failed',
        message: 'Unable to request camera permission.',
        source: 'prompt',
      },
    };
    mockQiblaAlignmentState = {
      ...mockQiblaAlignmentState,
      alignmentOffset: null,
      signedOffset: null,
      alignmentState: 'notAligned',
    };

    render(<QiblaScreen />);

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const failureEvent = events.find((event) => event.type === 'camera_permission_request_failed');
      expect(failureEvent).toBeDefined();
      expect(failureEvent?.payload.permissionSyncSource).toBe('prompt');
      expect(failureEvent?.payload.errorMessage).toBe('Unable to request camera permission.');
    });
  });

  it('records session start failures with structured details', async () => {
    mockPush.mockImplementation(() => {
      throw new Error('Navigation exploded');
    });

    render(<QiblaScreen />);
    act(() => {
      jest.advanceTimersByTime(900);
    });

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const failureEvent = events.find((event) => event.type === 'session_start_failed');
      expect(failureEvent).toBeDefined();
      expect(failureEvent?.payload.errorMessage).toBe('Navigation exploded');
      expect(failureEvent?.payload.trigger).toBe('system');
      expect(failureEvent?.payload.startTrigger).toBe('auto');
    });
  });

  it('records interrupted stability windows when alignment jitters away', async () => {
    mockCameraPermissionState = {
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    };
    mockCameraPermissionMeta = {
      permissionFlowState: 'granted',
      permissionSyncSource: 'coldStart',
      isRequestingPermission: false,
      lastPermissionFailure: null,
    };
    const { rerender } = render(<QiblaScreen />);

    act(() => {
      jest.advanceTimersByTime(450);
    });

    mockQiblaAlignmentState = {
      ...mockQiblaAlignmentState,
      alignmentOffset: 9,
      signedOffset: 9,
      alignmentState: 'notAligned',
    };
    rerender(<QiblaScreen />);

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const interruptedEvent = events.find(
        (event) => event.type === 'alignment_stability_interrupted',
      );
      expect(interruptedEvent).toBeDefined();
      expect(interruptedEvent?.payload.interruptionReason).toBe('alignment_lost');
    });
  });

  it('records location permission state failures from the alignment hook', async () => {
    mockQiblaAlignmentState = {
      ...mockQiblaAlignmentState,
      alignmentOffset: null,
      signedOffset: null,
      alignmentState: 'notAligned',
      locationPermissionStatus: 'denied',
      locationPermissionFlowState: 'blocked',
      canAskLocationPermission: false,
      locationError: 'Compass data is unavailable on this device.',
      lastLocationPermissionFailure: {
        code: 'location_permission_state_failed',
        message: 'Unable to initialize location services.',
        source: 'coldStart',
      },
    };

    render(<QiblaScreen />);

    await waitFor(async () => {
      const events = await loadIslamicSessionAnalyticsEvents();
      const failureEvent = events.find((event) => event.type === 'location_permission_state_failed');
      expect(failureEvent).toBeDefined();
      expect(failureEvent?.payload.failureCode).toBe('location_permission_state_failed');
      expect(failureEvent?.payload.permissionSyncSource).toBe('coldStart');
    });
  });
});
