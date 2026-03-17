import type { ChristianArSceneStyle } from '@/features/christian-prayer/constants';

const AMBIENT_TONE_MULTIPLIER: Record<ChristianArSceneStyle['ambientTone'], number> = {
  neutral: 1,
  soft: 0.94,
  warm: 1.06,
  subdued: 0.82,
  radiant: 1.16,
  outwardPulse: 1.02,
  calmGlow: 0.98,
  whiteGoldPeace: 1.2,
  closure: 0.9,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveChristianCandleEmissiveIntensity(
  sceneStyle: ChristianArSceneStyle,
  elapsedSeconds: number,
): number {
  const base = 0.26 + sceneStyle.candleIntensity * 1.22;
  const tone = AMBIENT_TONE_MULTIPLIER[sceneStyle.ambientTone];

  // Keep flicker subtle so it stays reverent and non-gamey.
  const flicker =
    1 +
    Math.sin(elapsedSeconds * 3.2 + 0.3) * 0.03 +
    Math.sin(elapsedSeconds * 5.4 + 1.1) * 0.02;

  return clamp(base * tone * flicker, 0.16, 2.15);
}
