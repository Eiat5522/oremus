import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lifecycle states for a native AR camera session.
 *
 * inactive      – no session running
 * initializing  – session requested, waiting for the native camera
 * detected      – the camera is streaming and a surface has been detected
 * error         – the camera failed to mount or the session was lost
 */
export type ARSessionState = 'inactive' | 'initializing' | 'detected' | 'error';

export interface ARSessionCallbacks {
  onPlaneDetected?: () => void;
  onError?: (error: string) => void;
}

/**
 * Manages a native AR camera session for surface detection.
 *
 * Surface detection is driven by the native camera's `onCameraReady`
 * callback rather than an arbitrary timeout.  The session transitions
 * through: inactive → initializing → detected.
 *
 * Wire the returned `handleCameraReady` and `handleMountError` callbacks
 * directly into a `<CameraView>` component from expo-camera.
 */
export function useARSession(callbacks?: ARSessionCallbacks) {
  const [sessionState, setSessionState] = useState<ARSessionState>('inactive');

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const startSession = useCallback(() => {
    setSessionState('initializing');
  }, []);

  const stopSession = useCallback(() => {
    setSessionState('inactive');
  }, []);

  /** Attach to CameraView's `onCameraReady` prop. */
  const handleCameraReady = useCallback(() => {
    setSessionState('detected');
    callbacksRef.current?.onPlaneDetected?.();
  }, []);

  /** Attach to CameraView's `onMountError` prop. */
  const handleMountError = useCallback((error: { message: string }) => {
    setSessionState('error');
    callbacksRef.current?.onError?.(error.message);
  }, []);

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
    startSession,
    stopSession,
    handleCameraReady,
    handleMountError,
  };
}
