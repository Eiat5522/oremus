export const CHRISTIAN_SESSION_DURATIONS = [3, 5, 10, 15] as const;

export type ChristianSessionDuration = (typeof CHRISTIAN_SESSION_DURATIONS)[number];

export type ChristianSessionMode =
  | 'dailyScripture'
  | 'guidedPrayer'
  | 'peace'
  | 'strength'
  | 'gratitude'
  | 'eveningReflection';

export type ChristianGuidedPrayerPhase =
  | 'praise'
  | 'confession'
  | 'thanksgiving'
  | 'intercession'
  | 'surrender';

export type ChristianPrayerPhase =
  | 'idle'
  | 'openingStillness'
  | 'scripture'
  | 'reflection'
  | ChristianGuidedPrayerPhase
  | 'blessing'
  | 'complete';

export type ChristianAmbientTone =
  | 'neutral'
  | 'soft'
  | 'warm'
  | 'subdued'
  | 'radiant'
  | 'outwardPulse'
  | 'calmGlow'
  | 'whiteGoldPeace'
  | 'closure';

export type ChristianCameraPermissionStatus = 'undetermined' | 'granted' | 'denied';

export type ChristianExperienceMode = 'ar' | 'fallback2d';

export type ChristianArEngineKind = 'mock' | 'unavailable';

export type ChristianArTrackingStatus =
  | 'idle'
  | 'initializing'
  | 'scanning'
  | 'trackingWeak'
  | 'surfaceDetected'
  | 'placed'
  | 'placementLost'
  | 'unsupported'
  | 'modelLoadFailed';

export type ChristianArErrorCode =
  | 'cameraPermissionDenied'
  | 'arUnsupported'
  | 'trackingWeak'
  | 'modelLoadFailed'
  | 'placementLost'
  | 'sessionInterrupted';

export type ChristianAnalyticsEventType =
  | 'session_started'
  | 'ar_surface_detected'
  | 'prayer_corner_placed'
  | 'phase_completed'
  | 'session_completed'
  | 'journal_saved'
  | 'session_abandoned'
  | 'model_preload_started'
  | 'model_preload_failed'
  | 'model_slot_missing'
  | '3d_stage_activated';

export interface ChristianVerse {
  id: string;
  title: string;
  reference: string;
  text: string;
  theme: string;
  mode: ChristianSessionMode | 'universal';
}

export interface ChristianReflectionDraft {
  text: string;
  tags: string[];
  voiceUri: string | null;
  silentTimerMinutes: number | null;
  updatedAtMs: number | null;
}

export interface ChristianAudioSettings {
  narrationEnabled: boolean;
  ambientEnabled: boolean;
  hapticsEnabled: boolean;
  reflectionPromptsEnabled: boolean;
}

export interface ChristianArSceneStyle {
  haloIntensity: number;
  candleIntensity: number;
  particleRate: number;
  ambientTone: ChristianAmbientTone;
}

export interface PrayerCornerTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
  z: number;
}

export interface ArPlacementState {
  status: ChristianArTrackingStatus;
  canPlace: boolean;
  isPlaced: boolean;
  trackingQuality: 'unknown' | 'weak' | 'good';
  transform: PrayerCornerTransform;
  guidance: string;
  retryCount: number;
  updatedAtMs: number | null;
  errorCode: ChristianArErrorCode | null;
}

export interface ChristianModeContent {
  mode: ChristianSessionMode;
  title: string;
  subtitle: string;
  description: string;
  setupPrompt: string;
  arrivalPrompt: string;
  scriptureIntro: string;
  reflectionPrompt: string;
  stillnessPrompt: string;
  blessing: string;
  journalPrompt: string;
  tags: string[];
  suggestedDuration: ChristianSessionDuration;
  heroVerse: ChristianVerse;
  prayerPrompts: Record<ChristianGuidedPrayerPhase, string>;
}

export interface ChristianSessionSummary {
  id: string;
  mode: ChristianSessionMode;
  title: string;
  verse: ChristianVerse;
  durationMinutes: ChristianSessionDuration;
  timeSpentSeconds: number;
  startedAtMs: number;
  completedAtMs: number;
  reflectionPreview: string | null;
  journalSaved: boolean;
}

export interface ChristianSessionState {
  sessionId: string | null;
  mode: ChristianSessionMode | null;
  durationMinutes: ChristianSessionDuration;
  selectedVerse: ChristianVerse | null;
  audioSettings: ChristianAudioSettings;
  reflectionDraft: ChristianReflectionDraft;
  cameraPermission: ChristianCameraPermissionStatus;
  experienceMode: ChristianExperienceMode;
  arEngine: ChristianArEngineKind;
  arSupported: boolean;
  arInitialized: boolean;
  arPlacement: ArPlacementState;
  currentPhase: ChristianPrayerPhase;
  phaseHistory: ChristianPrayerPhase[];
  sessionStartedAtMs: number | null;
  sessionCompletedAtMs: number | null;
  currentRoute: string | null;
  isDraft: boolean;
  isInterrupted: boolean;
  isCompleted: boolean;
  completionSummary: ChristianSessionSummary | null;
  lastErrorCode: ChristianArErrorCode | null;
}

export interface ChristianSessionActions {
  createDraftSession: (mode?: ChristianSessionMode) => void;
  updateSetupSelections: (update: {
    mode?: ChristianSessionMode;
    durationMinutes?: ChristianSessionDuration;
    selectedVerse?: ChristianVerse | null;
    audioSettings?: Partial<ChristianAudioSettings>;
  }) => void;
  setCurrentRoute: (route: string | null) => void;
  setCameraPermission: (status: ChristianCameraPermissionStatus) => void;
  setExperienceMode: (mode: ChristianExperienceMode) => void;
  setArSupport: (supported: boolean) => void;
  initializeArEngine: (engine: ChristianArEngineKind) => void;
  setArPlacementState: (state: ArPlacementState) => void;
  placePrayerCorner: (transform?: Partial<PrayerCornerTransform>) => void;
  updatePrayerCorner: (transform: Partial<PrayerCornerTransform>) => void;
  setCurrentPhase: (phase: ChristianPrayerPhase) => void;
  advancePrayerPhase: () => void;
  saveReflectionDraft: (update: Partial<ChristianReflectionDraft>) => void;
  markSessionStarted: (phase?: ChristianPrayerPhase) => void;
  completeSession: (summary: ChristianSessionSummary) => void;
  abandonSession: (errorCode?: ChristianArErrorCode) => void;
  resumeSession: () => void;
  resetSession: () => void;
}

export interface ChristianAnalyticsEvent {
  id: string;
  type: ChristianAnalyticsEventType;
  timestampMs: number;
  sessionId: string | null;
  mode: ChristianSessionMode | null;
  phase: ChristianPrayerPhase | null;
  payload?: Record<string, string | number | boolean | null>;
}

export interface CompletedChristianSessionRecord extends ChristianSessionSummary {}

export interface FavoriteChristianVerseRecord {
  verse: ChristianVerse;
  savedAtMs: number;
}
