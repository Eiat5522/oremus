import { useCallback, useEffect, useRef } from 'react';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

// TODO: [NATIVE AR SWAP-IN] Replace this with an actual AR session manager
// when integrating ViroReact or Expo AR native module.
// The abstraction below keeps the same interface so screens don't need to change.

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
  } = useBuddhistPrayerStore();

  // Refs to hold latest callbacks without re-running effects
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // In immersive3D mode, simulate surface detection with a timer
  // TODO: [NATIVE AR SWAP-IN] Replace this simulation with real AR plane detection callback
  const simulateScanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginScan = useCallback(() => {
    startScan();
    if (altarExperienceMode === 'immersive3D') {
      // Simulate finding a surface after ~2.5 seconds
      simulateScanTimeout.current = setTimeout(() => {
        surfaceDetected();
        callbacksRef.current?.onSurfaceDetected?.();
      }, 2500);
    }
    // TODO: [NATIVE AR SWAP-IN] In nativeARReady mode, start real AR session here
    // and listen for ARPlaneAnchor detected event from native module
  }, [altarExperienceMode, startScan, surfaceDetected]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulateScanTimeout.current) {
        clearTimeout(simulateScanTimeout.current);
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
  };
}
