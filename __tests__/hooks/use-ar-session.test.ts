import { renderHook, act } from '@testing-library/react-native';
import { useARSession } from '@/hooks/use-ar-session';

describe('useARSession', () => {
  it('starts in inactive state', () => {
    const { result } = renderHook(() => useARSession());
    expect(result.current.sessionState).toBe('inactive');
  });

  it('transitions to initializing on startSession', () => {
    const { result } = renderHook(() => useARSession());
    act(() => {
      result.current.startSession();
    });
    expect(result.current.sessionState).toBe('initializing');
  });

  it('transitions to scanning on onCameraReady', () => {
    const { result } = renderHook(() => useARSession());
    act(() => {
      result.current.startSession();
      result.current.onCameraReady();
    });
    expect(result.current.sessionState).toBe('scanning');
  });

  it('transitions to detected on confirmSurface and calls onPlaneDetected', () => {
    const onPlaneDetected = jest.fn();
    const { result } = renderHook(() => useARSession(onPlaneDetected));
    act(() => {
      result.current.startSession();
      result.current.onCameraReady();
      result.current.confirmSurface();
    });
    expect(result.current.sessionState).toBe('detected');
    expect(onPlaneDetected).toHaveBeenCalledTimes(1);
  });

  it('does not call onPlaneDetected twice if confirmSurface is called twice', () => {
    const onPlaneDetected = jest.fn();
    const { result } = renderHook(() => useARSession(onPlaneDetected));
    act(() => {
      result.current.startSession();
      result.current.onCameraReady();
      result.current.confirmSurface();
      result.current.confirmSurface();
    });
    expect(onPlaneDetected).toHaveBeenCalledTimes(1);
  });

  it('transitions to error on onCameraError', () => {
    const { result } = renderHook(() => useARSession());
    act(() => {
      result.current.startSession();
      result.current.onCameraError(new Error('Camera failed'));
    });
    expect(result.current.sessionState).toBe('error');
  });

  it('resets state on stopSession', () => {
    const { result } = renderHook(() => useARSession());
    act(() => {
      result.current.startSession();
      result.current.onCameraReady();
      result.current.stopSession();
    });
    expect(result.current.sessionState).toBe('inactive');
  });
});
