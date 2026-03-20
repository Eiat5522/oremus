import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import {
  __resetChristianPrayerCornerModelCacheForTests,
  loadChristianPrayerCornerModels,
  selectChristianCoreModelReadiness,
} from '@/features/christian-prayer/services/christianModels.service';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@/features/christian-prayer/constants/model-modules', () => ({
  CHRISTIAN_PRAYER_CORNER_MODEL_MODULES: {
    cross_wood_a: null,
    bible_open_a: null,
    candle_tall_a: null,
    candle_short_a: null,
    prayer_table_wood_a: null,
  },
}));

describe('christianModels.service', () => {
  beforeEach(() => {
    __resetChristianPrayerCornerModelCacheForTests();
  });

  it('returns missing slots when module registry is unassigned', async () => {
    const snapshot = await loadChristianPrayerCornerModels({ forceRefresh: true });

    expect(snapshot.error).toBeNull();
    expect(snapshot.assets).toHaveLength(5);
    expect(snapshot.missingAssetIds.length).toBeGreaterThan(0);
    expect(snapshot.coreReady).toBe(false);
  });

  it('core readiness selector requires cross, bible, and prayer table slots to be ready', () => {
    expect(
      selectChristianCoreModelReadiness({
        error: null,
        assets: [
          {
            id: 'cross_wood_a',
            fileName: 'cross_wood_a.glb',
            pivot: 'bottomCenter',
            role: 'hero',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 1,
            localUri: 'file://cross.glb',
            attempts: 1,
          },
        ],
      }),
    ).toBe(false);

    expect(
      selectChristianCoreModelReadiness({
        error: null,
        assets: [
          {
            id: 'cross_wood_a',
            fileName: 'cross_wood_a.glb',
            pivot: 'bottomCenter',
            role: 'hero',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 1,
            localUri: 'file://cross.glb',
            attempts: 1,
          },
          {
            id: 'bible_open_a',
            fileName: 'bible_open_a.glb',
            pivot: 'bottomCenter',
            role: 'hero',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 2,
            localUri: 'file://bible.glb',
            attempts: 1,
          },
        ],
      }),
    ).toBe(false);

    expect(
      selectChristianCoreModelReadiness({
        error: null,
        assets: [
          {
            id: 'cross_wood_a',
            fileName: 'cross_wood_a.glb',
            pivot: 'bottomCenter',
            role: 'hero',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 1,
            localUri: 'file://cross.glb',
            attempts: 1,
          },
          {
            id: 'bible_open_a',
            fileName: 'bible_open_a.glb',
            pivot: 'bottomCenter',
            role: 'hero',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 2,
            localUri: 'file://bible.glb',
            attempts: 1,
          },
          {
            id: 'prayer_table_wood_a',
            fileName: 'prayer_table_wood_a.glb',
            pivot: 'bottomCenter',
            role: 'base',
            maxTriangles: 8000,
            maxTextureSize: 1024,
            scaleHint: 1,
            status: 'ready',
            moduleId: 3,
            localUri: 'file://table.glb',
            attempts: 1,
          },
        ],
      }),
    ).toBe(true);
  });
});
