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
  jesus_statue_a: {
    position: [0, 0.35, -0.05],
    rotation: [0, 0, 0],
    scale: [0.95, 0.95, 0.95],
  },
  cross_wood_a: {
    position: [0, 1.45, -0.35],
    rotation: [0, 0, 0],
    scale: [0.62, 0.62, 0.62],
  },
  bible_open_a: {
    position: [0, 0.12, 0.55],
    rotation: [0, 0, 0],
    scale: [0.82, 0.82, 0.82],
  },
  candle_tall_a: {
    position: [-1.15, 0.2, 0.14],
    rotation: [0, 0.18, 0],
    scale: [0.88, 0.88, 0.88],
  },
  candle_short_a: {
    position: [1.15, 0.16, 0.16],
    rotation: [0, -0.16, 0],
    scale: [0.76, 0.76, 0.76],
  },
  prayer_table_wood_a: {
    position: [0, -0.84, 0.08],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
};
