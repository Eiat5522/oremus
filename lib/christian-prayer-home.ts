import type { Href } from 'expo-router';

import type {
  ChristianPrayerPhase,
  ChristianSessionMode,
} from '@/features/christian-prayer/constants';
import { getChristianModeContent } from '@/features/christian-prayer/services/christianContent.service';
import { getChristianPhaseRoute } from '@/features/christian-prayer/services/christianSession.service';

export interface ChristianHomeSessionCardState {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  progressLabel: string;
  primaryRoute: Href;
}

type ChristianSessionCardInput = {
  mode: ChristianSessionMode | null;
  currentPhase: ChristianPrayerPhase;
  experienceMode: 'ar' | 'fallback2d';
  sessionStartedAtMs: number | null;
  sessionCompletedAtMs: number | null;
};

export function getChristianHomeSessionCardState({
  mode,
  currentPhase,
  experienceMode,
  sessionStartedAtMs,
  sessionCompletedAtMs,
}: ChristianSessionCardInput): ChristianHomeSessionCardState | null {
  if (!mode) {
    return null;
  }

  const content = getChristianModeContent(mode);

  if (sessionCompletedAtMs) {
    return {
      eyebrow: 'Last Prayer',
      title: content.title,
      description: 'Your most recent Christian prayer corner session is ready to revisit.',
      primaryLabel: 'View Completion',
      secondaryLabel: 'Start Over',
      progressLabel: 'Completed',
      primaryRoute: '/christian/complete' as Href,
    };
  }

  if (sessionStartedAtMs) {
    return {
      eyebrow: 'Continue Prayer',
      title: content.title,
      description: `Resume from ${currentPhase === 'idle' ? 'your setup' : currentPhase}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: currentPhase === 'idle' ? 'Setup' : currentPhase,
      primaryRoute: getChristianPhaseRoute(currentPhase, experienceMode) as Href,
    };
  }

  return null;
}
