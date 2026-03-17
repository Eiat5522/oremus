import { resolveIslamicPrayerChantTrack } from '@/lib/islamic-prayer-chant-track';

describe('resolveIslamicPrayerChantTrack', () => {
  it('resolves per-prayer track identifiers while sharing the current sample source', () => {
    const fajrTrack = resolveIslamicPrayerChantTrack('fajr');
    const ishaTrack = resolveIslamicPrayerChantTrack('isha');

    expect(fajrTrack.trackId).toBe('fajr-guided-sample');
    expect(ishaTrack.trackId).toBe('isha-guided-sample');
    expect(fajrTrack.sourceKey).toBe(ishaTrack.sourceKey);
    expect(fajrTrack.usesFallbackSource).toBe(true);
    expect(ishaTrack.usesFallbackSource).toBe(true);
  });

  it('falls back to the shared sample mapping when no prayer-specific track is available', () => {
    expect(resolveIslamicPrayerChantTrack(null)).toEqual({
      prayerName: null,
      trackId: 'shared-guided-sample',
      sourceKey: 'shared-islamic-sample',
      usesFallbackSource: true,
    });
  });
});
