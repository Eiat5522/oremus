import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import type { ChristianPrayerPhase } from '@/features/christian-prayer/constants';
import { trackChristianAnalyticsEvent } from '@/features/christian-prayer/services/christianAnalytics.service';
import { triggerChristianPhaseChangeHaptic } from '@/features/christian-prayer/services/christianHaptics.service';
import {
  getChristianPhaseRoute,
  getChristianNextPhase,
} from '@/features/christian-prayer/services/christianSession.service';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

export function useChristianPhaseNavigation() {
  const router = useRouter();
  const {
    audioSettings,
    currentPhase,
    experienceMode,
    mode,
    sessionId,
    advancePrayerPhase,
    markSessionStarted,
    setCurrentPhase,
  } = useChristianSessionStore();

  const goToPhase = useCallback(
    (phase: ChristianPrayerPhase) => {
      setCurrentPhase(phase);
      router.replace(getChristianPhaseRoute(phase, experienceMode) as never);
    },
    [experienceMode, router, setCurrentPhase],
  );

  const beginPrayerFlow = useCallback(() => {
    markSessionStarted('openingStillness');
    router.replace(getChristianPhaseRoute('openingStillness', experienceMode) as never);
    void trackChristianAnalyticsEvent({
      type: 'session_started',
      sessionId,
      mode,
      phase: 'openingStillness',
    });
  }, [experienceMode, markSessionStarted, mode, router, sessionId]);

  const advanceToNextPhase = useCallback(() => {
    const nextPhase = getChristianNextPhase(currentPhase);
    advancePrayerPhase();
    router.replace(getChristianPhaseRoute(nextPhase, experienceMode) as never);

    if (currentPhase !== 'idle' && currentPhase !== 'complete') {
      void trackChristianAnalyticsEvent({
        type: 'phase_completed',
        sessionId,
        mode,
        phase: currentPhase,
      });
      void triggerChristianPhaseChangeHaptic(audioSettings.hapticsEnabled);
    }
  }, [
    advancePrayerPhase,
    audioSettings.hapticsEnabled,
    currentPhase,
    experienceMode,
    mode,
    router,
    sessionId,
  ]);

  return {
    advanceToNextPhase,
    beginPrayerFlow,
    goToPhase,
  };
}
