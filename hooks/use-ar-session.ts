import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lifecycle states for a native AR camera session.
 *
 * inactive      – no session running
 * initializing  – session requested, waiting for the native camera
 * scanning      – camera is streaming; waiting for the user to confirm a surface
 * detected      – a flat surface has been explicitly confirmed for altar placement
 * error         – the camera failed to mount or the session was lost
 */
export type ARSessionState = 'inactive' | 'initializing' | 'scanning' | 'detected' | 'error';

export interface ARSessionCallbacks {
  onPlaneDetected?: () => void;
  onError?: (error: string) => void;
}

/**
 * Manages a native AR camera session for surface detection.
 *
 * Surface detection follows a two-step flow that separates "camera hardware
 * ready" from "surface confirmed":
 *
 *   inactive → initializing → scanning → detected
 *
 * 1. `handleCameraReady` (from CameraView's `onCameraReady`) transitions
 *    initializing → scanning.  The camera is now live but no surface has
 *    been selected yet.
 * 2. `confirmSurface` is called when the user explicitly taps on a flat
 *    surface in the camera view, transitioning scanning → detected and
 *    firing the `onPlaneDetected` callback.
 *
 * Wire `handleCameraReady` and `handleMountError` directly into a
 * `<CameraView>` from expo-camera, and call `confirmSurface` from a tap
 * handler on the camera preview.
 */
export function useARSession(callbacks?: ARSessionCallbacks) {
  const [sessionState, setSessionState] = useState<ARSessionState>('inactive');

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Tracks the previous session state to detect transitions in effects.
  const sessionStateRef = useRef<ARSessionState>('inactive');

  const startSession = useCallback(() => {
    setSessionState('initializing');
  }, []);

  const stopSession = useCallback(() => {
    setSessionState('inactive');
  }, []);

  /**
   * Attach to CameraView's `onCameraReady` prop.
   * Transitions initializing → scanning.  Camera ready does NOT mean a
   * surface has been detected.
   */
  const handleCameraReady = useCallback(() => {
    setSessionState((prev) => (prev === 'initializing' ? 'scanning' : prev));
  }, []);

  /**
   * Call when the user taps on a flat surface in the camera preview.
   * Transitions scanning → detected and fires the `onPlaneDetected` callback.
   */
  const confirmSurface = useCallback(() => {
    setSessionState((prev) => (prev === 'scanning' ? 'detected' : prev));
  }, []);

  /** Attach to CameraView's `onMountError` prop. */
  const handleMountError = useCallback((error: { message: string }) => {
    setSessionState('error');
    callbacksRef.current?.onError?.(error.message);
  }, []);

  // Fire onPlaneDetected exactly once when transitioning into the detected state.
  useEffect(() => {
    const prev = sessionStateRef.current;
    sessionStateRef.current = sessionState;
    if (sessionState === 'detected' && prev === 'scanning') {
      callbacksRef.current?.onPlaneDetected?.();
    }
  }, [sessionState]);

  // Cleanup is implicit – stopSession resets state.  The owning
  // component should call stopSession on unmount if needed.
  useEffect(() => {
    return () => {
      setSessionState('inactive');
    };
  }, []);

  return {
    sessionState,
    isDetected: sessionState === 'detected',
    isScanning: sessionState === 'scanning',
    startSession,
    stopSession,
    handleCameraReady,
    confirmSurface,
    handleMountError,
  };
}
