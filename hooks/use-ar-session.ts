import { useState, useCallback, useRef } from 'react';

export type ARSessionState = 'inactive' | 'initializing' | 'scanning' | 'detected' | 'error';

export interface UseARSessionResult {
  sessionState: ARSessionState;
  startSession: () => void;
  stopSession: () => void;
  onCameraReady: () => void;
  confirmSurface: () => void;
  onCameraError: (error: unknown) => void;
}

export function useARSession(
  onPlaneDetected?: () => void
): UseARSessionResult {
  const [sessionState, setSessionState] = useState<ARSessionState>('inactive');
  const detectedRef = useRef(false);

  const startSession = useCallback(() => {
    setSessionState('initializing');
    detectedRef.current = false;
  }, []);

  const stopSession = useCallback(() => {
    setSessionState('inactive');
    detectedRef.current = false;
  }, []);

  const onCameraReady = useCallback(() => {
    setSessionState('scanning');
  }, []);

  const confirmSurface = useCallback(() => {
    if (!detectedRef.current) {
      detectedRef.current = true;
      setSessionState('detected');
      onPlaneDetected?.();
    }
  }, [onPlaneDetected]);

  const onCameraError = useCallback(() => {
    setSessionState('error');
  }, []);

  return {
    sessionState,
    startSession,
    stopSession,
    onCameraReady,
    confirmSurface,
    onCameraError,
  };
}
