import {
  getRequiredChristianModelIds,
  parseChristianPrayerCornerManifest,
} from '@/features/christian-prayer/constants/model-manifest';

describe('Christian model manifest', () => {
  it('parses the checked-in manifest with all required asset ids', () => {
    const rawManifest = require('@/assets/models/christian/manifest.json') as unknown;
    const manifest = parseChristianPrayerCornerManifest(rawManifest);
    const requiredIds = new Set(getRequiredChristianModelIds());

    expect(manifest.tradition).toBe('christian');
    expect(manifest.format).toBe('glb');
    expect(manifest.assets).toHaveLength(requiredIds.size);
    expect(new Set(manifest.assets.map((asset) => asset.id))).toEqual(requiredIds);
  });
});
