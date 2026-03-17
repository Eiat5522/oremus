import { Asset } from 'expo-asset';

import type {
  ChristianPrayerCornerAssetId,
  ChristianPrayerCornerAssetManifestItem,
  ChristianPrayerCornerManifest,
} from '@/features/christian-prayer/constants/model-manifest';
import { parseChristianPrayerCornerManifest } from '@/features/christian-prayer/constants/model-manifest';
import { CHRISTIAN_PRAYER_CORNER_MODEL_MODULES } from '@/features/christian-prayer/constants/model-modules';

const CORE_MODEL_IDS = ['cross_wood_a', 'bible_open_a'] as const;
const MODEL_RETRY_COUNT = 1;

export type ChristianModelSlotStatus = 'ready' | 'missing' | 'failed';

export interface ChristianResolvedPrayerCornerAsset extends ChristianPrayerCornerAssetManifestItem {
  status: ChristianModelSlotStatus;
  moduleId: number | null;
  localUri: string | null;
  attempts: number;
}

export interface ChristianPrayerCornerModelSnapshot {
  manifest: ChristianPrayerCornerManifest | null;
  assets: ChristianResolvedPrayerCornerAsset[];
  readyAssetCount: number;
  missingAssetIds: ChristianPrayerCornerAssetId[];
  failedAssetIds: ChristianPrayerCornerAssetId[];
  coreReady: boolean;
  isLoading: boolean;
  error: string | null;
}

let modelSnapshotCache: ChristianPrayerCornerModelSnapshot | null = null;
let modelPreloadPromise: Promise<ChristianPrayerCornerModelSnapshot> | null = null;

function getManifestJson(): unknown {
  return require('@/assets/models/christian/manifest.json');
}

function buildInitialModelSnapshot(): ChristianPrayerCornerModelSnapshot {
  return {
    manifest: null,
    assets: [],
    readyAssetCount: 0,
    missingAssetIds: [],
    failedAssetIds: [],
    coreReady: false,
    isLoading: true,
    error: null,
  };
}

async function resolveAssetWithRetry(
  assetItem: ChristianPrayerCornerAssetManifestItem,
): Promise<ChristianResolvedPrayerCornerAsset> {
  const moduleId = CHRISTIAN_PRAYER_CORNER_MODEL_MODULES[assetItem.id];

  if (!moduleId) {
    return {
      ...assetItem,
      status: 'missing',
      moduleId: null,
      localUri: null,
      attempts: 0,
    };
  }

  let attempts = 0;
  while (attempts <= MODEL_RETRY_COUNT) {
    attempts += 1;
    try {
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();

      return {
        ...assetItem,
        status: 'ready',
        moduleId,
        localUri: asset.localUri ?? asset.uri,
        attempts,
      };
    } catch {
      if (attempts > MODEL_RETRY_COUNT) {
        return {
          ...assetItem,
          status: 'failed',
          moduleId,
          localUri: null,
          attempts,
        };
      }
    }
  }

  return {
    ...assetItem,
    status: 'failed',
    moduleId,
    localUri: null,
    attempts: MODEL_RETRY_COUNT + 1,
  };
}

export function selectChristianCoreModelReadiness(
  snapshot: Pick<ChristianPrayerCornerModelSnapshot, 'assets' | 'error'>,
): boolean {
  if (snapshot.error) {
    return false;
  }

  return CORE_MODEL_IDS.every((assetId) =>
    snapshot.assets.some((asset) => asset.id === assetId && asset.status === 'ready'),
  );
}

export async function loadChristianPrayerCornerModels(
  options?: { forceRefresh?: boolean },
): Promise<ChristianPrayerCornerModelSnapshot> {
  const forceRefresh = options?.forceRefresh === true;

  if (!forceRefresh && modelSnapshotCache) {
    return modelSnapshotCache;
  }

  if (!forceRefresh && modelPreloadPromise) {
    return modelPreloadPromise;
  }

  modelPreloadPromise = (async () => {
    try {
      const manifest = parseChristianPrayerCornerManifest(getManifestJson());
      const assets = await Promise.all(manifest.assets.map(resolveAssetWithRetry));
      const missingAssetIds = assets.filter((entry) => entry.status === 'missing').map((a) => a.id);
      const failedAssetIds = assets.filter((entry) => entry.status === 'failed').map((a) => a.id);

      const snapshot: ChristianPrayerCornerModelSnapshot = {
        manifest,
        assets,
        readyAssetCount: assets.filter((entry) => entry.status === 'ready').length,
        missingAssetIds,
        failedAssetIds,
        coreReady: selectChristianCoreModelReadiness({ assets, error: null }),
        isLoading: false,
        error: null,
      };

      modelSnapshotCache = snapshot;
      return snapshot;
    } catch (error) {
      const snapshot: ChristianPrayerCornerModelSnapshot = {
        ...buildInitialModelSnapshot(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to load Christian model manifest',
      };
      modelSnapshotCache = snapshot;
      return snapshot;
    } finally {
      modelPreloadPromise = null;
    }
  })();

  return modelPreloadPromise;
}

export function preloadChristianPrayerCornerModels(): Promise<ChristianPrayerCornerModelSnapshot> {
  return loadChristianPrayerCornerModels();
}

export function getCachedChristianPrayerCornerModelSnapshot(): ChristianPrayerCornerModelSnapshot {
  return modelSnapshotCache ?? buildInitialModelSnapshot();
}

export function __resetChristianPrayerCornerModelCacheForTests() {
  modelSnapshotCache = null;
  modelPreloadPromise = null;
}
