import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useQiblaAlignment } from '@/hooks/use-qibla-alignment';

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockGetHeadingAsync = jest.fn();
const mockWatchHeadingAsync = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('expo-location', () => ({
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
  },
  Accuracy: {
    Balanced: 'balanced',
  },
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockRequestForegroundPermissionsAsync(...args),
  getForegroundPermissionsAsync: (...args: unknown[]) => mockGetForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args),
  getHeadingAsync: (...args: unknown[]) => mockGetHeadingAsync(...args),
  watchHeadingAsync: (...args: unknown[]) => mockWatchHeadingAsync(...args),
}));

describe('useQiblaAlignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 13.7563, longitude: 100.5018 },
    });
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    });
    mockGetHeadingAsync.mockResolvedValue({ trueHeading: 120, magHeading: 120 });
    mockWatchHeadingAsync.mockResolvedValue({ remove: jest.fn() });
  });

  it('surfaces a recoverable location-permission state when access is denied', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: true,
      granted: false,
      expires: 'never',
    });

    const { result } = renderHook(() => useQiblaAlignment());

    await waitFor(() => {
      expect(result.current.locationPermissionStatus).toBe('denied');
      expect(result.current.isRequestingLocationPermission).toBe(false);
    });
    expect(result.current.locationError).toBe('Location access helps improve Qibla precision.');
    expect(result.current.canAskLocationPermission).toBe(true);
    expect(result.current.locationPermissionFlowState).toBe('deniedAskable');
    expect(result.current.locationPermissionSyncSource).toBe('coldStart');
    expect(result.current.alignmentOffset).toBeNull();
  });

  it('can recover after permission is granted later from the Qibla screen', async () => {
    mockRequestForegroundPermissionsAsync
      .mockResolvedValueOnce({
        status: 'denied',
        canAskAgain: true,
        granted: false,
        expires: 'never',
      })
      .mockResolvedValueOnce({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

    const { result } = renderHook(() => useQiblaAlignment());

    await waitFor(() => {
      expect(result.current.locationPermissionStatus).toBe('denied');
    });

    await act(async () => {
      await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.locationPermissionStatus).toBe('granted');
      expect(result.current.isRequestingLocationPermission).toBe(false);
    });

    expect(result.current.locationError).toBeNull();
    expect(result.current.locationPermissionFlowState).toBe('granted');
    expect(result.current.locationPermissionSyncSource).toBe('prompt');
    expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
    expect(mockGetHeadingAsync).toHaveBeenCalled();
    expect(mockWatchHeadingAsync).toHaveBeenCalled();
  });

  it('tracks a deterministic settings-return recovery path', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    });
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    });

    const { result } = renderHook(() => useQiblaAlignment());

    await waitFor(() => {
      expect(result.current.isRequestingLocationPermission).toBe(false);
      expect(result.current.locationPermissionFlowState).toBe('blocked');
    });

    await act(async () => {
      await result.current.refreshLocationPermission('settingsReturn');
    });

    await waitFor(() => {
      expect(result.current.locationPermissionStatus).toBe('granted');
    });

    expect(result.current.locationPermissionFlowState).toBe('granted');
    expect(result.current.locationPermissionSyncSource).toBe('settingsReturn');
    expect(result.current.locationError).toBeNull();
  });
});
