import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/qibla';

describe('qibla utilities', () => {
  it('returns near-zero distance in Makkah', () => {
    const distance = getDistanceToKaabaKm(21.4225, 39.8262);
    expect(distance).toBeLessThan(0.1);
  });

  it('returns valid compass bearing range', () => {
    const bearing = getQiblaBearing(40.7128, -74.006);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });
});
