import type {
  ChristianGuidedPrayerPhase,
  ChristianPrayerPhase,
} from '@/features/christian-prayer/constants';

export const CHRISTIAN_PHASE_SEQUENCE: ChristianPrayerPhase[] = [
  'openingStillness',
  'scripture',
  'reflection',
  'praise',
  'confession',
  'thanksgiving',
  'intercession',
  'surrender',
  'blessing',
  'complete',
];

export const CHRISTIAN_GUIDED_PRAYER_PHASES: ChristianGuidedPrayerPhase[] = [
  'praise',
  'confession',
  'thanksgiving',
  'intercession',
  'surrender',
];

export function getNextChristianPhase(currentPhase: ChristianPrayerPhase): ChristianPrayerPhase {
  if (currentPhase === 'idle') {
    return 'openingStillness';
  }

  const currentIndex = CHRISTIAN_PHASE_SEQUENCE.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === CHRISTIAN_PHASE_SEQUENCE.length - 1) {
    return 'complete';
  }

  return CHRISTIAN_PHASE_SEQUENCE[currentIndex + 1];
}

export function getPreviousChristianPhase(
  currentPhase: ChristianPrayerPhase,
): ChristianPrayerPhase {
  const currentIndex = CHRISTIAN_PHASE_SEQUENCE.indexOf(currentPhase);
  if (currentIndex <= 0) {
    return 'openingStillness';
  }
  return CHRISTIAN_PHASE_SEQUENCE[currentIndex - 1];
}

export function isChristianFlowPhase(phase: ChristianPrayerPhase): boolean {
  return phase !== 'idle' && phase !== 'complete';
}

export function isGuidedPrayerPhase(
  phase: ChristianPrayerPhase,
): phase is ChristianGuidedPrayerPhase {
  return CHRISTIAN_GUIDED_PRAYER_PHASES.includes(phase as ChristianGuidedPrayerPhase);
}
