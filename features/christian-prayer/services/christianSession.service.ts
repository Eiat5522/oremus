import type {
  ArPlacementState,
  ChristianPrayerPhase,
  ChristianSessionMode,
  ChristianSessionState,
  ChristianSessionSummary,
  PrayerCornerTransform,
} from '@/features/christian-prayer/constants';
import { getSuggestedChristianVerse } from '@/features/christian-prayer/services/christianContent.service';
import { getNextChristianPhase } from '@/features/christian-prayer/utils/phase';

export const DEFAULT_PRAYER_CORNER_TRANSFORM: PrayerCornerTransform = {
  scale: 1,
  rotation: 0,
  x: 0,
  y: 0,
  z: 0,
};

export const DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE: ArPlacementState = {
  status: 'idle',
  canPlace: false,
  isPlaced: false,
  trackingQuality: 'unknown',
  transform: DEFAULT_PRAYER_CORNER_TRANSFORM,
  guidance: 'Scan a flat surface to prepare the prayer corner.',
  retryCount: 0,
  updatedAtMs: null,
  errorCode: null,
};

export const LEGACY_CHRISTIAN_TEMPLATE_TO_MODE: Record<string, ChristianSessionMode> = {
  'peace-in-christ': 'peace',
  'gratitude-and-thanksgiving': 'gratitude',
  'seeking-guidance': 'guidedPrayer',
  'rest-for-the-weary': 'eveningReflection',
};

export function createChristianSessionId(): string {
  return `christian-${Date.now()}`;
}

export function buildChristianDraftState(mode: ChristianSessionMode | null): Pick<
  ChristianSessionState,
  'sessionId' | 'mode' | 'selectedVerse' | 'isDraft' | 'currentPhase'
> {
  return {
    sessionId: createChristianSessionId(),
    mode,
    selectedVerse: mode ? getSuggestedChristianVerse(mode) : null,
    isDraft: true,
    currentPhase: 'idle',
  };
}

export function getChristianPhaseRoute(
  phase: ChristianPrayerPhase,
  experienceMode: ChristianSessionState['experienceMode'],
): string {
  const basePath = experienceMode === 'fallback2d' ? '/christian-2d' : '/christian';

  switch (phase) {
    case 'openingStillness':
      return `${basePath}/stillness`;
    case 'scripture':
      return `${basePath}/scripture`;
    case 'reflection':
      return `${basePath}/reflection`;
    case 'praise':
    case 'confession':
    case 'thanksgiving':
    case 'intercession':
    case 'surrender':
      return `${basePath}/prayer`;
    case 'blessing':
      return `${basePath}/blessing`;
    case 'complete':
      return `${basePath}/complete`;
    case 'idle':
    default:
      return experienceMode === 'fallback2d' ? '/christian-2d/index' : '/christian/index';
  }
}

export function getChristianResumeRoute(state: Pick<
  ChristianSessionState,
  'currentRoute' | 'experienceMode' | 'currentPhase' | 'isCompleted' | 'isDraft'
>): string {
  if (state.isCompleted) {
    return state.experienceMode === 'fallback2d' ? '/christian-2d/complete' : '/christian/complete';
  }

  if (state.currentRoute) {
    return state.currentRoute;
  }

  if (!state.isDraft) {
    return getChristianPhaseRoute(state.currentPhase, state.experienceMode);
  }

  return state.experienceMode === 'fallback2d' ? '/christian-2d/index' : '/christian/index';
}

export function getChristianNextPhase(currentPhase: ChristianPrayerPhase): ChristianPrayerPhase {
  return getNextChristianPhase(currentPhase);
}

export function buildChristianSessionSummary(input: {
  sessionId: string;
  mode: ChristianSessionMode;
  title: string;
  verse: ChristianSessionSummary['verse'];
  durationMinutes: ChristianSessionSummary['durationMinutes'];
  startedAtMs: number;
  completedAtMs: number;
  reflectionPreview: string | null;
  journalSaved?: boolean;
}): ChristianSessionSummary {
  return {
    id: input.sessionId,
    mode: input.mode,
    title: input.title,
    verse: input.verse,
    durationMinutes: input.durationMinutes,
    timeSpentSeconds: Math.max(0, Math.floor((input.completedAtMs - input.startedAtMs) / 1000)),
    startedAtMs: input.startedAtMs,
    completedAtMs: input.completedAtMs,
    reflectionPreview: input.reflectionPreview,
    journalSaved: input.journalSaved ?? false,
  };
}

export function normalizePrayerCornerTransform(
  transform: Partial<PrayerCornerTransform>,
  current: PrayerCornerTransform,
): PrayerCornerTransform {
  const nextScale = transform.scale ?? current.scale;
  const nextRotation = transform.rotation ?? current.rotation;

  const normalizeAxis = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  return {
    scale: normalizeAxis(nextScale, 0.8, 1.45),
    rotation: ((nextRotation % 360) + 360) % 360,
    x: normalizeAxis(transform.x ?? current.x, -1.2, 1.2),
    y: normalizeAxis(transform.y ?? current.y, -0.8, 1.2),
    z: normalizeAxis(transform.z ?? current.z, -0.4, 1.4),
  };
}

export function resolveChristianModeFromLegacyTemplate(templateId?: string | null): ChristianSessionMode {
  if (templateId && LEGACY_CHRISTIAN_TEMPLATE_TO_MODE[templateId]) {
    return LEGACY_CHRISTIAN_TEMPLATE_TO_MODE[templateId];
  }

  return 'dailyScripture';
}
