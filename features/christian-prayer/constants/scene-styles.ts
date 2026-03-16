import type { ChristianArSceneStyle, ChristianPrayerPhase } from './types';

export const CHRISTIAN_SCENE_STYLE_BY_PHASE: Record<ChristianPrayerPhase, ChristianArSceneStyle> = {
  idle: {
    haloIntensity: 0.26,
    candleIntensity: 0.28,
    particleRate: 0.2,
    ambientTone: 'neutral',
  },
  openingStillness: {
    haloIntensity: 0.34,
    candleIntensity: 0.38,
    particleRate: 0.28,
    ambientTone: 'soft',
  },
  scripture: {
    haloIntensity: 0.48,
    candleIntensity: 0.52,
    particleRate: 0.38,
    ambientTone: 'warm',
  },
  reflection: {
    haloIntensity: 0.36,
    candleIntensity: 0.42,
    particleRate: 0.3,
    ambientTone: 'soft',
  },
  praise: {
    haloIntensity: 0.56,
    candleIntensity: 0.58,
    particleRate: 0.46,
    ambientTone: 'warm',
  },
  confession: {
    haloIntensity: 0.28,
    candleIntensity: 0.34,
    particleRate: 0.22,
    ambientTone: 'subdued',
  },
  thanksgiving: {
    haloIntensity: 0.68,
    candleIntensity: 0.72,
    particleRate: 0.52,
    ambientTone: 'radiant',
  },
  intercession: {
    haloIntensity: 0.52,
    candleIntensity: 0.56,
    particleRate: 0.44,
    ambientTone: 'outwardPulse',
  },
  surrender: {
    haloIntensity: 0.62,
    candleIntensity: 0.5,
    particleRate: 0.34,
    ambientTone: 'calmGlow',
  },
  blessing: {
    haloIntensity: 0.82,
    candleIntensity: 0.82,
    particleRate: 0.62,
    ambientTone: 'whiteGoldPeace',
  },
  complete: {
    haloIntensity: 0.58,
    candleIntensity: 0.52,
    particleRate: 0.32,
    ambientTone: 'closure',
  },
};
