import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeEntry {
  name: PrayerName;
  label: string;
  time: Date;
}

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function getPrayerTimesForDate(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
): PrayerTimeEntry[] {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const orderedNames: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  return orderedNames.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    time: prayerTimes[name],
  }));
}

export function getNextPrayer(prayerTimes: PrayerTimeEntry[], now: Date = new Date()) {
  return prayerTimes.find((prayer) => prayer.time.getTime() > now.getTime()) ?? null;
}

export function getCurrentPrayerName(prayers: PrayerTimeEntry[], now: Date): PrayerName | null {
  if (prayers.length === 0) {
    return null;
  }

  for (let index = 0; index < prayers.length; index += 1) {
    const current = prayers[index];
    const next = prayers[index + 1];

    if (!next) {
      if (now.getTime() >= current.time.getTime()) {
        return current.name;
      }
      break;
    }

    if (now.getTime() >= current.time.getTime() && now.getTime() < next.time.getTime()) {
      return current.name;
    }
  }

  return null;
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
