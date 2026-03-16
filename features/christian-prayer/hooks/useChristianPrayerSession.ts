import { useEffect, useMemo, useState } from 'react';

import {
  type ChristianModeContent,
  type ChristianSessionMode,
} from '@/features/christian-prayer/constants';
import {
  getChristianModeContent,
  getSuggestedChristianVerse,
} from '@/features/christian-prayer/services/christianContent.service';
import { getChristianPhaseRoute } from '@/features/christian-prayer/services/christianSession.service';
import {
  CHRISTIAN_GUIDED_PRAYER_PHASES,
  CHRISTIAN_PHASE_SEQUENCE,
  isGuidedPrayerPhase,
} from '@/features/christian-prayer/utils/phase';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

export function useChristianPrayerSession() {
  const store = useChristianSessionStore();
  const [, setElapsedTick] = useState(0);

  useEffect(() => {
    if (!store.sessionStartedAtMs || store.sessionCompletedAtMs) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTick((currentTick) => currentTick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [store.sessionCompletedAtMs, store.sessionStartedAtMs]);

  const modeContent = useMemo<ChristianModeContent | null>(() => {
    if (!store.mode) {
      return null;
    }
    return getChristianModeContent(store.mode);
  }, [store.mode]);

  const selectedVerse = useMemo(() => {
    if (store.selectedVerse) {
      return store.selectedVerse;
    }

    if (!store.mode) {
      return null;
    }

    return getSuggestedChristianVerse(store.mode);
  }, [store.mode, store.selectedVerse]);

  const phaseIndex = useMemo(() => {
    if (store.currentPhase === 'idle') {
      return 0;
    }
    return CHRISTIAN_PHASE_SEQUENCE.indexOf(store.currentPhase) + 1;
  }, [store.currentPhase]);

  const activePrayerPhaseIndex = useMemo(() => {
    if (!isGuidedPrayerPhase(store.currentPhase)) {
      return 0;
    }

    return CHRISTIAN_GUIDED_PRAYER_PHASES.indexOf(store.currentPhase) + 1;
  }, [store.currentPhase]);

  const prayerProgressRoute = useMemo(
    () => getChristianPhaseRoute(store.currentPhase, store.experienceMode),
    [store.currentPhase, store.experienceMode],
  );

  const elapsedSeconds = !store.sessionStartedAtMs
    ? 0
    : Math.max(
        0,
        Math.floor(((store.sessionCompletedAtMs ?? Date.now()) - store.sessionStartedAtMs) / 1000),
      );

  return {
    ...store,
    activePrayerPhaseIndex,
    elapsedSeconds,
    isGuidedPrayerPhase: isGuidedPrayerPhase(store.currentPhase),
    modeContent,
    phaseIndex,
    prayerPhaseCount: CHRISTIAN_GUIDED_PRAYER_PHASES.length,
    prayerProgressRoute,
    selectedVerse,
  };
}

export function useChristianSessionModeContent(mode: ChristianSessionMode | null) {
  return useMemo(() => {
    if (!mode) {
      return null;
    }
    return getChristianModeContent(mode);
  }, [mode]);
}
