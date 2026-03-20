export type ChristianSceneModel = 'wooden_table' | 'communion_setup' | 'cross_altar';

export interface ChristianSceneConfig {
  modelPath: string;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface ChristianPrayerSession {
  id: string;
  prayerType: 'lords_prayer' | 'hail_mary' | 'rosary' | 'custom';
  startedAt: Date;
  durationSeconds: number;
  completed: boolean;
}
