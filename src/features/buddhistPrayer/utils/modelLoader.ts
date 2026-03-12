import { Asset } from 'expo-asset';

const loadAsset = async (assetModule: number) => {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
};

export const preloadAltarModels = async (modelModules: number[]) => {
  try {
    await Promise.all(modelModules.map(loadAsset));
    return { ready: true as const, error: null };
  } catch (error) {
    return {
      ready: false as const,
      error: error instanceof Error ? error.message : 'Model preload failed',
    };
  }
};
