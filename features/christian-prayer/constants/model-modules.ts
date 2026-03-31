import type { ChristianPrayerCornerAssetId } from '@/features/christian-prayer/constants/model-manifest';

export type ChristianPrayerCornerModuleRegistry = Record<ChristianPrayerCornerAssetId, number | null>;

// Keep this map intentionally explicit so adding a new GLB is a one-line change.
// Example:
// cross_wood_a: require('@/assets/models/christian/cross_wood_a.glb')
export const CHRISTIAN_PRAYER_CORNER_MODEL_MODULES: ChristianPrayerCornerModuleRegistry = {
  jesus_statue_a: require('@/assets/models/christian/jesus_statue_a.glb'),
  cross_wood_a: require('@/assets/models/christian/cross_wood_a.glb'),
  bible_open_a: require('@/assets/models/christian/bible_open_a.glb'),
  candle_tall_a: require('@/assets/models/christian/candle_tall_a.glb'),
  candle_short_a: require('@/assets/models/christian/candle_short_a.glb'),
  prayer_table_wood_a: require('@/assets/models/christian/prayer_table_wood_a.glb'),
};
