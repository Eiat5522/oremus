import type {
  ArPlacementState,
  ChristianPrayerPhase,
  PrayerCornerTransform,
} from '@/features/christian-prayer/constants';
import {
  DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
  normalizePrayerCornerTransform,
} from '@/features/christian-prayer/services/christianSession.service';

import type { ChristianArEngine } from './ChristianArEngine';

export class MockChristianArEngine implements ChristianArEngine {
  private placementState: ArPlacementState = {
    ...DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
  };

  private scanTimeout: ReturnType<typeof setTimeout> | null = null;
  private weakTrackingTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentPhase: ChristianPrayerPhase = 'idle';

  async initialize(): Promise<{ supported: boolean; errorCode: ArPlacementState['errorCode'] }> {
    this.placementState = {
      ...DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
      status: 'initializing',
      guidance: 'Preparing the camera-led prayer corner experience.',
      updatedAtMs: Date.now(),
    };

    return { supported: true, errorCode: null };
  }

  async startSession(): Promise<void> {
    this.clearTimers();
    this.placementState = {
      ...this.placementState,
      status: 'scanning',
      canPlace: false,
      isPlaced: false,
      trackingQuality: 'unknown',
      guidance: 'Move your phone slowly and let the room settle into view.',
      updatedAtMs: Date.now(),
      errorCode: null,
    };

    this.weakTrackingTimeout = setTimeout(() => {
      this.placementState = {
        ...this.placementState,
        status: 'trackingWeak',
        trackingQuality: 'weak',
        guidance: 'The surface is almost ready. Keep a little more distance and move slowly.',
        updatedAtMs: Date.now(),
        errorCode: 'trackingWeak',
      };
    }, 650);

    this.scanTimeout = setTimeout(() => {
      this.placementState = {
        ...this.placementState,
        status: 'surfaceDetected',
        canPlace: true,
        trackingQuality: 'good',
        guidance: 'Surface found. Place the prayer corner when it feels reverent and steady.',
        updatedAtMs: Date.now(),
        errorCode: null,
      };
    }, 1600);
  }

  async stopSession(): Promise<void> {
    this.clearTimers();
    this.placementState = {
      ...DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
      guidance: 'The prayer corner session is paused.',
      updatedAtMs: Date.now(),
    };
  }

  async resetPlacement(): Promise<void> {
    this.clearTimers();
    this.placementState = {
      ...DEFAULT_CHRISTIAN_AR_PLACEMENT_STATE,
      status: 'placementLost',
      guidance: 'Placement reset. Re-scan the surface and place the prayer corner again.',
      retryCount: this.placementState.retryCount + 1,
      updatedAtMs: Date.now(),
      errorCode: 'placementLost',
    };
  }

  async placePrayerCorner(transform?: Partial<PrayerCornerTransform>): Promise<ArPlacementState> {
    this.clearTimers();

    const nextTransform = normalizePrayerCornerTransform(
      transform ?? {},
      this.placementState.transform,
    );

    this.placementState = {
      ...this.placementState,
      status: 'placed',
      canPlace: true,
      isPlaced: true,
      trackingQuality: 'good',
      transform: nextTransform,
      guidance: 'Prayer corner placed. Fine-tune it until it feels still and grounded.',
      updatedAtMs: Date.now(),
      errorCode: null,
    };

    return this.placementState;
  }

  async updatePrayerCorner(transform: Partial<PrayerCornerTransform>): Promise<ArPlacementState> {
    const nextTransform = normalizePrayerCornerTransform(transform, this.placementState.transform);

    this.placementState = {
      ...this.placementState,
      transform: nextTransform,
      updatedAtMs: Date.now(),
    };

    return this.placementState;
  }

  async setScenePhase(phase: ChristianPrayerPhase): Promise<void> {
    this.currentPhase = phase;
  }

  getPlacementState(): ArPlacementState {
    return {
      ...this.placementState,
      transform: {
        ...this.placementState.transform,
      },
    };
  }

  getCurrentPhase(): ChristianPrayerPhase {
    return this.currentPhase;
  }

  private clearTimers() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.weakTrackingTimeout) {
      clearTimeout(this.weakTrackingTimeout);
      this.weakTrackingTimeout = null;
    }
  }
}
