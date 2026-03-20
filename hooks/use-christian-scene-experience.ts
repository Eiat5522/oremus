import { useState, useEffect, useCallback, useRef } from 'react';

export type ChristianSceneMode = 'nativeARReady' | 'immersive3D';

export const DEFAULT_CHRISTIAN_SCENE_MODE: ChristianSceneMode = 'immersive3D';

const SURFACE_DETECTION_TIMEOUT_MS = 1400;

export interface UseChristianSceneExperienceResult {
  mode: ChristianSceneMode;
  isSceneReady: boolean;
  startExperience: (mode?: ChristianSceneMode) => void;
  onCameraReady: () => void;
  onCameraError: () => void;
  resetExperience: () => void;
}

export function useChristianSceneExperience(): UseChristianSceneExperienceResult {
  const [mode, setMode] = useState<ChristianSceneMode>(DEFAULT_CHRISTIAN_SCENE_MODE);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startExperience = useCallback(
    (selectedMode: ChristianSceneMode = DEFAULT_CHRISTIAN_SCENE_MODE) => {
      setMode(selectedMode);
      setIsSceneReady(false);

      if (selectedMode === 'immersive3D') {
        timerRef.current = setTimeout(() => {
          setIsSceneReady(true);
        }, SURFACE_DETECTION_TIMEOUT_MS);
      }
    },
    []
  );

  const onCameraReady = useCallback(() => {
    if (mode === 'nativeARReady') {
      setIsSceneReady(true);
    }
  }, [mode]);

  const onCameraError = useCallback(() => {
    // Auto-fallback to immersive3D on camera error
    setMode('immersive3D');
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsSceneReady(true);
    }, SURFACE_DETECTION_TIMEOUT_MS);
  }, [clearTimer]);

  const resetExperience = useCallback(() => {
    clearTimer();
    setIsSceneReady(false);
    setMode(DEFAULT_CHRISTIAN_SCENE_MODE);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    mode,
    isSceneReady,
    startExperience,
    onCameraReady,
    onCameraError,
    resetExperience,
  };
}
