import type {
  ArPlacementState,
  ChristianPrayerPhase,
  PrayerCornerTransform,
} from '@/features/christian-prayer/constants';

export interface ChristianArEngine {
  initialize(): Promise<{ supported: boolean; errorCode: ArPlacementState['errorCode'] }>;
  startSession(): Promise<void>;
  stopSession(): Promise<void>;
  resetPlacement(): Promise<void>;
  placePrayerCorner(transform?: Partial<PrayerCornerTransform>): Promise<ArPlacementState>;
  updatePrayerCorner(transform: Partial<PrayerCornerTransform>): Promise<ArPlacementState>;
  setScenePhase(phase: ChristianPrayerPhase): Promise<void>;
  getPlacementState(): ArPlacementState;
}
