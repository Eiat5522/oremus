import { useCallback, useEffect, useRef } from 'react';

import { useARSession } from './use-ar-session';
import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

const IMMERSIVE_3D_SCAN_DURATION_MS = 1400;

export type AltarExperienceCallbacks = {
  onSurfaceDetected?: () => void;
  onAltarPlaced?: () => void;
  onError?: (error: string) => void;
};

export function useAltarExperience(callbacks?: AltarExperienceCallbacks) {
  const {
    scanStatus,
    altarPlaced,
    placementScale,
    placementRotation,
    altarExperienceMode,
    startScan,
    surfaceDetected,
    placeAltar,
    updatePlacementScale,
    updatePlacementRotation,
    resetPlacement,
    setError,
    setAltarExperienceMode,
  } = useBuddhistPrayerStore();

  // Refs to hold latest callbacks without re-running effects
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Native AR session – driven by real camera callbacks from expo-camera.
  const {
    sessionState: arSessionState,
    startSession: startARSession,
    stopSession: stopARSession,
    handleCameraReady,
    confirmSurface,
    handleMountError: handleCameraMountError,
  } = useARSession({
    onPlaneDetected: () => {
      surfaceDetected();
      callbacksRef.current?.onSurfaceDetected?.();
    },
    onError: (error) => {
      setError(error);
      // Automatically fall back to the immersive scene so the user can
      // still complete the flow when the camera is unavailable.
      setAltarExperienceMode('immersive3D');
      callbacksRef.current?.onError?.(error);
    },
  });

  // In immersive3D mode the scan is simulated with a short timer.
  const scanSimulationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginScan = useCallback(() => {
    startScan();

    if (altarExperienceMode === 'nativeARReady') {
      // Start the native AR camera session – surface detection will
      // be signalled by the CameraView's onCameraReady callback.
      startARSession();
    } else {
      // immersive3D: brief simulated detection for the fallback scene.
      scanSimulationTimeoutRef.current = setTimeout(() => {
        surfaceDetected();
        callbacksRef.current?.onSurfaceDetected?.();
      }, IMMERSIVE_3D_SCAN_DURATION_MS);
    }
  }, [altarExperienceMode, startARSession, startScan, surfaceDetected]);

  const confirmPlacement = useCallback(() => {
    placeAltar();
    callbacksRef.current?.onAltarPlaced?.();
  }, [placeAltar]);

  const adjustScale = useCallback(
    (delta: number) => {
      updatePlacementScale(placementScale + delta);
    },
    [placementScale, updatePlacementScale],
  );

  const adjustRotation = useCallback(
    (delta: number) => {
      updatePlacementRotation(placementRotation + delta);
    },
    [placementRotation, updatePlacementRotation],
  );

  const resetAltarPlacement = useCallback(() => {
    resetPlacement();
  }, [resetPlacement]);

  // Stop the AR session when falling back to immersive3D.
  useEffect(() => {
    if (altarExperienceMode !== 'nativeARReady') {
      stopARSession();
    }
  }, [altarExperienceMode, stopARSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanSimulationTimeoutRef.current) {
        clearTimeout(scanSimulationTimeoutRef.current);
      }
    };
  }, []);

  return {
    scanStatus,
    altarPlaced,
    placementScale,
    placementRotation,
    altarExperienceMode,
    isScanning: scanStatus === 'scanning',
    isSurfaceDetected: scanStatus === 'detected' || scanStatus === 'placed',
    beginScan,
    confirmPlacement,
    adjustScale,
    adjustRotation,
    resetAltarPlacement,
    setError,
    // AR session – wire into CameraView on the scan screen
    arSessionState,
    handleCameraReady,
    confirmSurface,
    handleCameraMountError,
  };
}
