import type { ChristianSceneConfig } from './types';

export const WOODEN_TABLE_MODEL_PATH =
  'assets/models/wooden_table._practical_model_-_yadira.glb';

export const DEFAULT_SCENE_CONFIG: ChristianSceneConfig = {
  modelPath: WOODEN_TABLE_MODEL_PATH,
  scale: [0.8, 0.8, 0.8],
  position: [0, -0.5, -1.5],
  rotation: [0, 0, 0],
};

export const SCENE_LIGHTING = {
  ambientIntensity: 0.6,
  directionalIntensity: 0.8,
  directionalPosition: [5, 10, 5] as [number, number, number],
};
