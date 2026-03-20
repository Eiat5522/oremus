import type { ChristianPrayerCornerAssetId } from '@/features/christian-prayer/constants/model-manifest';

export interface ChristianModelTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export const CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS: Record<
  ChristianPrayerCornerAssetId,
  ChristianModelTransform
> = {
  cross_wood_a: {
    position: [0, 1.12, -0.2],
    rotation: [0, 0, 0],
    scale: [0.78, 0.78, 0.78],
  },
  bible_open_a: {
    position: [0, 0.22, 0.44],
    rotation: [0, 0, 0],
    scale: [0.92, 0.92, 0.92],
  },
  candle_tall_a: {
    position: [-1.15, 0.2, 0.14],
    rotation: [0, 0.18, 0],
    scale: [0.88, 0.88, 0.88],
  },
  candle_short_a: {
    position: [1.15, 0.16, 0.16],
    rotation: [0, -0.16, 0],
    scale: [0.84, 0.84, 0.84],
  },
  prayer_table_wood_a: {
    position: [0, -0.84, 0.08],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
};
