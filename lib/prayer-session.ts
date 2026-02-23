import type { PrayerName } from '@/lib/prayer-times';

type PrayerEntry = {
  name: PrayerName;
  time: Date;
};

export function isPrayerSessionPassed(
  prayers: PrayerEntry[],
  index: number,
  now: Date,
  isToday: boolean,
  isComplete: boolean,
  isRescheduled: boolean,
): boolean {
  if (!isToday) return false;
  if (isComplete || isRescheduled) return false;

  const nextPrayer = prayers[index + 1];

  if (!nextPrayer) {
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return now.getTime() >= midnight.getTime();
  }

  return now.getTime() > nextPrayer.time.getTime();
}
