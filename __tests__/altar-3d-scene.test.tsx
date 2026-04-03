import { loadAltarAsset } from '@/components/buddhist-prayer/altar-3d-scene';

const loadOrder: string[] = [];
const mockAssetFromModule = jest.fn(() => ({
  downloadAsync: jest.fn(async () => {
    loadOrder.push('download');
  }),
  localUri: 'mock://asset/incense.glb',
  uri: 'mock://asset/incense.glb',
}));
const mockLoadAsync = jest.fn(async () => {
  const { Group } = require('three');
  return { scene: new Group() };
});

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: (...args: unknown[]) => mockAssetFromModule(...args),
  },
}));

jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    loadAsync: (...args: unknown[]) => {
      loadOrder.push('load');
      return mockLoadAsync(...args);
    },
  })),
}));

jest.mock('@react-three/fiber/native', () => ({
  Canvas: jest.fn(),
  useFrame: jest.fn(),
}));

jest.mock('@/lib/three-native', () => ({
  createNativeCanvasRenderer: jest.fn(),
  ensureNativeThreeEnvironment: jest.fn(),
}));

describe('AltarScene3D', () => {
  beforeEach(() => {
    loadOrder.length = 0;
    jest.clearAllMocks();
  });

  it('downloads GLB assets before starting the native GLTF loads', async () => {
    await loadAltarAsset(123);

    expect(mockAssetFromModule).toHaveBeenCalledWith(123);
    expect(mockLoadAsync).toHaveBeenCalledWith('mock://asset/incense.glb');
    expect(loadOrder).toEqual(['download', 'load']);
  });
});
