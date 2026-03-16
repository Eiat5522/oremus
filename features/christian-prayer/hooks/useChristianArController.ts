import { useCallback, useEffect, useMemo, useRef } from 'react';

import type {
  ChristianArEngineKind,
  ChristianPrayerPhase,
  PrayerCornerTransform,
} from '@/features/christian-prayer/constants';
import { getSharedChristianArEngine } from '@/features/christian-prayer/ar/christianArEngineFactory';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

interface ChristianArControllerOptions {
  polling?: boolean;
  engineType?: Exclude<ChristianArEngineKind, 'unavailable'>;
}

export function useChristianArController(options?: ChristianArControllerOptions) {
  const initializeArEngine = useChristianSessionStore((state) => state.initializeArEngine);
  const setArSupport = useChristianSessionStore((state) => state.setArSupport);
  const setArPlacementState = useChristianSessionStore((state) => state.setArPlacementState);
  const arPlacement = useChristianSessionStore((state) => state.arPlacement);
  const engineRef = useRef(getSharedChristianArEngine());
  const polling = options?.polling ?? true;
  const engineType = options?.engineType ?? 'mock';

  const syncPlacementState = useCallback(() => {
    const nextState = engineRef.current.getPlacementState();
    setArPlacementState(nextState);
    return nextState;
  }, [setArPlacementState]);

  useEffect(() => {
    if (!polling) {
      return;
    }

    const interval = setInterval(() => {
      syncPlacementState();
    }, 250);

    return () => clearInterval(interval);
  }, [polling, syncPlacementState]);

  const initializeAndStart = useCallback(async () => {
    initializeArEngine(engineType);
    const result = await engineRef.current.initialize();
    if (!result.supported) {
      setArSupport(false);
      syncPlacementState();
      return result;
    }

    await engineRef.current.startSession();
    syncPlacementState();
    return result;
  }, [engineType, initializeArEngine, setArSupport, syncPlacementState]);

  const stopSession = useCallback(async () => {
    await engineRef.current.stopSession();
    syncPlacementState();
  }, [syncPlacementState]);

  const resetPlacement = useCallback(async () => {
    await engineRef.current.resetPlacement();
    syncPlacementState();
  }, [syncPlacementState]);

  const placePrayerCorner = useCallback(
    async (transform?: Partial<PrayerCornerTransform>) => {
      const nextState = await engineRef.current.placePrayerCorner(transform);
      setArPlacementState(nextState);
      return nextState;
    },
    [setArPlacementState],
  );

  const updatePrayerCorner = useCallback(
    async (transform: Partial<PrayerCornerTransform>) => {
      const nextState = await engineRef.current.updatePrayerCorner(transform);
      setArPlacementState(nextState);
      return nextState;
    },
    [setArPlacementState],
  );

  const setScenePhase = useCallback(async (phase: ChristianPrayerPhase) => {
    await engineRef.current.setScenePhase(phase);
  }, []);

  return useMemo(
    () => ({
      arPlacement,
      initializeAndStart,
      placePrayerCorner,
      resetPlacement,
      setScenePhase,
      stopSession,
      syncPlacementState,
      updatePrayerCorner,
    }),
    [
      arPlacement,
      initializeAndStart,
      placePrayerCorner,
      resetPlacement,
      setScenePhase,
      stopSession,
      syncPlacementState,
      updatePrayerCorner,
    ],
  );
}
