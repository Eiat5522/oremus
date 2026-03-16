import { MockChristianArEngine } from '@/features/christian-prayer/ar/MockChristianArEngine';

import type { ChristianArEngine } from './ChristianArEngine';

let sharedChristianArEngine: ChristianArEngine | null = null;

export function getSharedChristianArEngine(): ChristianArEngine {
  if (!sharedChristianArEngine) {
    sharedChristianArEngine = new MockChristianArEngine();
  }
  return sharedChristianArEngine;
}

export function resetSharedChristianArEngine(): void {
  sharedChristianArEngine = null;
}
