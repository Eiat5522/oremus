import type { PrayerName } from '@/lib/prayer-times';

export type IslamicPrayerChantTrack = {
  prayerName: PrayerName | null;
  trackId: string;
  sourceKey: string;
  usesFallbackSource: boolean;
};

const SHARED_SAMPLE_SOURCE_KEY = 'shared-islamic-sample';

const PRAYER_TRACK_MAP: Record<PrayerName, IslamicPrayerChantTrack> = {
  fajr: {
    prayerName: 'fajr',
    trackId: 'fajr-guided-sample',
    sourceKey: SHARED_SAMPLE_SOURCE_KEY,
    usesFallbackSource: true,
  },
  dhuhr: {
    prayerName: 'dhuhr',
    trackId: 'dhuhr-guided-sample',
    sourceKey: SHARED_SAMPLE_SOURCE_KEY,
    usesFallbackSource: true,
  },
  asr: {
    prayerName: 'asr',
    trackId: 'asr-guided-sample',
    sourceKey: SHARED_SAMPLE_SOURCE_KEY,
    usesFallbackSource: true,
  },
  maghrib: {
    prayerName: 'maghrib',
    trackId: 'maghrib-guided-sample',
    sourceKey: SHARED_SAMPLE_SOURCE_KEY,
    usesFallbackSource: true,
  },
  isha: {
    prayerName: 'isha',
    trackId: 'isha-guided-sample',
    sourceKey: SHARED_SAMPLE_SOURCE_KEY,
    usesFallbackSource: true,
  },
};

const DEFAULT_TRACK: IslamicPrayerChantTrack = {
  prayerName: null,
  trackId: 'shared-guided-sample',
  sourceKey: SHARED_SAMPLE_SOURCE_KEY,
  usesFallbackSource: true,
};

export function resolveIslamicPrayerChantTrack(
  prayerName: PrayerName | null | undefined,
): IslamicPrayerChantTrack {
  if (!prayerName) {
    return DEFAULT_TRACK;
  }

  return PRAYER_TRACK_MAP[prayerName] ?? DEFAULT_TRACK;
}
