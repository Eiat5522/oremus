import { resolveChristianCandleEmissiveIntensity } from '@/features/christian-prayer/utils/candle-emissive';

describe('resolveChristianCandleEmissiveIntensity', () => {
  it('keeps intensity in safe bounds', () => {
    const intensity = resolveChristianCandleEmissiveIntensity(
      {
        haloIntensity: 0.8,
        candleIntensity: 0.82,
        particleRate: 0.6,
        ambientTone: 'whiteGoldPeace',
      },
      12.3,
    );

    expect(intensity).toBeGreaterThanOrEqual(0.16);
    expect(intensity).toBeLessThanOrEqual(2.15);
  });

  it('subdued ambient tone is dimmer than radiant with same candle intensity', () => {
    const subdued = resolveChristianCandleEmissiveIntensity(
      {
        haloIntensity: 0.3,
        candleIntensity: 0.5,
        particleRate: 0.2,
        ambientTone: 'subdued',
      },
      3,
    );
    const radiant = resolveChristianCandleEmissiveIntensity(
      {
        haloIntensity: 0.3,
        candleIntensity: 0.5,
        particleRate: 0.2,
        ambientTone: 'radiant',
      },
      3,
    );

    expect(radiant).toBeGreaterThan(subdued);
  });
});
