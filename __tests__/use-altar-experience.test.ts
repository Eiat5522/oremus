import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { renderHook, act } from '@testing-library/react-native';

import { useAltarExperience } from '@/hooks/use-altar-experience';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('useAltarExperience', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useBuddhistPrayerStore.getState().resetSession();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('defaults to immersive3D mode', () => {
    const { result } = renderHook(() => useAltarExperience());
    expect(result.current.altarExperienceMode).toBe('immersive3D');
  });

  it('simulates surface detection with a timer in immersive3D mode', () => {
    const onSurfaceDetected = jest.fn();
    const { result } = renderHook(() => useAltarExperience({ onSurfaceDetected }));

    act(() => {
      result.current.beginScan();
    });

    expect(result.current.isScanning).toBe(true);
    expect(result.current.isSurfaceDetected).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1400);
    });

    expect(result.current.isSurfaceDetected).toBe(true);
    expect(onSurfaceDetected).toHaveBeenCalledTimes(1);
  });

  it('starts the AR session instead of a timer in nativeARReady mode', () => {
    useBuddhistPrayerStore.getState().setAltarExperienceMode('nativeARReady');
    const onSurfaceDetected = jest.fn();
    const { result } = renderHook(() => useAltarExperience({ onSurfaceDetected }));

    act(() => {
      result.current.beginScan();
    });

    expect(result.current.isScanning).toBe(true);
    expect(result.current.arSessionState).toBe('initializing');

    // No detection yet – waiting for the native camera callback
    expect(result.current.isSurfaceDetected).toBe(false);
    expect(onSurfaceDetected).not.toHaveBeenCalled();

    // Advancing timers should NOT trigger detection (no timeout in native mode)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.isSurfaceDetected).toBe(false);
  });

  it('detects a surface when the camera reports ready in nativeARReady mode', () => {
    useBuddhistPrayerStore.getState().setAltarExperienceMode('nativeARReady');
    const onSurfaceDetected = jest.fn();
    const { result } = renderHook(() => useAltarExperience({ onSurfaceDetected }));

    act(() => {
      result.current.beginScan();
    });

    act(() => {
      result.current.handleCameraReady();
    });

    expect(result.current.isSurfaceDetected).toBe(true);
    expect(result.current.arSessionState).toBe('detected');
    expect(onSurfaceDetected).toHaveBeenCalledTimes(1);
  });

  it('falls back to immersive3D when the camera fails to mount', () => {
    useBuddhistPrayerStore.getState().setAltarExperienceMode('nativeARReady');
    const onError = jest.fn();
    const { result } = renderHook(() => useAltarExperience({ onError }));

    act(() => {
      result.current.beginScan();
    });

    act(() => {
      result.current.handleCameraMountError({ message: 'Camera unavailable' });
    });

    expect(useBuddhistPrayerStore.getState().altarExperienceMode).toBe('immersive3D');
    expect(onError).toHaveBeenCalledWith('Camera unavailable');
  });

  it('stops the AR session when mode switches away from nativeARReady', () => {
    useBuddhistPrayerStore.getState().setAltarExperienceMode('nativeARReady');
    const { result } = renderHook(() => useAltarExperience());

    act(() => {
      result.current.beginScan();
    });
    expect(result.current.arSessionState).toBe('initializing');

    act(() => {
      useBuddhistPrayerStore.getState().setAltarExperienceMode('immersive3D');
    });

    expect(result.current.arSessionState).toBe('inactive');
  });
});
