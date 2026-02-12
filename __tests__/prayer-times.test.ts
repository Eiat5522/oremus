import { getNextPrayer, getPrayerTimesForDate } from '@/lib/prayer-times';

describe('prayer times', () => {
  it('returns five prayers for a day', () => {
    const times = getPrayerTimesForDate(21.3891, 39.8579, new Date('2026-02-11T08:00:00Z'));
    expect(times).toHaveLength(5);
  });

  it('finds next prayer', () => {
    const date = new Date('2026-02-11T08:00:00Z');
    const times = getPrayerTimesForDate(21.3891, 39.8579, date);
    const next = getNextPrayer(times, new Date('2026-02-11T00:30:00Z'));
    expect(next).not.toBeNull();
  });
});
