import { renderHook, act } from '@testing-library/react-native';
import { useARSession } from '@/hooks/use-ar-session';

describe('useARSession', () => {
  it('starts in the inactive state', () => {
    const { result } = renderHook(() => useARSession());
    expect(result.current.sessionState).toBe('inactive');
    expect(result.current.isDetected).toBe(false);
    expect(result.current.isScanning).toBe(false);
  });

  it('transitions to initializing when the session starts', () => {
    const { result } = renderHook(() => useARSession());

    act(() => {
      result.current.startSession();
    });

    expect(result.current.sessionState).toBe('initializing');
    expect(result.current.isDetected).toBe(false);
    expect(result.current.isScanning).toBe(false);
  });

  it('transitions to scanning on camera ready (not detected)', () => {
    const onPlaneDetected = jest.fn();
    const { result } = renderHook(() => useARSession({ onPlaneDetected }));

    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.handleCameraReady();
    });

    expect(result.current.sessionState).toBe('scanning');
    expect(result.current.isScanning).toBe(true);
    expect(result.current.isDetected).toBe(false);
    // onPlaneDetected must NOT fire yet – camera ready ≠ surface detected
    expect(onPlaneDetected).not.toHaveBeenCalled();
  });

  it('transitions to detected when the user confirms a surface and fires onPlaneDetected', () => {
    const onPlaneDetected = jest.fn();
    const { result } = renderHook(() => useARSession({ onPlaneDetected }));

    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.handleCameraReady();
    });
    expect(result.current.sessionState).toBe('scanning');

    act(() => {
      result.current.confirmSurface();
    });

    expect(result.current.sessionState).toBe('detected');
    expect(result.current.isDetected).toBe(true);
    expect(result.current.isScanning).toBe(false);
    expect(onPlaneDetected).toHaveBeenCalledTimes(1);
  });

  it('confirmSurface is a no-op when not in the scanning state', () => {
    const onPlaneDetected = jest.fn();
    const { result } = renderHook(() => useARSession({ onPlaneDetected }));

    // In inactive state, confirmSurface should do nothing
    act(() => {
      result.current.confirmSurface();
    });
    expect(result.current.sessionState).toBe('inactive');
    expect(onPlaneDetected).not.toHaveBeenCalled();
  });

  it('transitions to error on camera mount failure and fires onError', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useARSession({ onError }));

    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.handleMountError({ message: 'Camera unavailable' });
    });

    expect(result.current.sessionState).toBe('error');
    expect(result.current.isDetected).toBe(false);
    expect(onError).toHaveBeenCalledWith('Camera unavailable');
  });

  it('returns to inactive when the session is stopped', () => {
    const { result } = renderHook(() => useARSession());

    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.handleCameraReady();
    });
    act(() => {
      result.current.confirmSurface();
    });
    expect(result.current.isDetected).toBe(true);

    act(() => {
      result.current.stopSession();
    });
    expect(result.current.sessionState).toBe('inactive');
    expect(result.current.isDetected).toBe(false);
    expect(result.current.isScanning).toBe(false);
  });

  it('picks up updated callbacks without restarting the session', () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const { result, rerender } = renderHook(({ cb }) => useARSession({ onPlaneDetected: cb }), {
      initialProps: { cb: firstCallback },
    });

    act(() => {
      result.current.startSession();
    });
    act(() => {
      result.current.handleCameraReady();
    });

    rerender({ cb: secondCallback });

    act(() => {
      result.current.confirmSurface();
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
