import {
  CHRISTIAN_DAILY_VERSES,
  CHRISTIAN_MODE_CONTENT,
  type ChristianModeContent,
  type ChristianSessionMode,
  type ChristianVerse,
} from '@/features/christian-prayer/constants';

function getLocalDaySeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 1000 + month * 50 + day;
}

export function getDailyChristianVerse(date: Date = new Date()): ChristianVerse {
  const seed = getLocalDaySeed(date);
  return CHRISTIAN_DAILY_VERSES[seed % CHRISTIAN_DAILY_VERSES.length];
}

export function getChristianModeContent(mode: ChristianSessionMode): ChristianModeContent {
  return CHRISTIAN_MODE_CONTENT[mode];
}

export function getChristianModeOptions(): ChristianModeContent[] {
  return Object.values(CHRISTIAN_MODE_CONTENT);
}

export function getSuggestedChristianVerse(
  mode: ChristianSessionMode,
  date: Date = new Date(),
): ChristianVerse {
  if (mode === 'dailyScripture') {
    return getDailyChristianVerse(date);
  }
  return getChristianModeContent(mode).heroVerse;
}

export function getChristianVersePreview(
  mode: ChristianSessionMode,
  date: Date = new Date(),
): ChristianVerse {
  return getSuggestedChristianVerse(mode, date);
}

export function getChristianReflectionPrompt(mode: ChristianSessionMode): string {
  return getChristianModeContent(mode).reflectionPrompt;
}

export function getChristianPrayerPrompt(
  mode: ChristianSessionMode,
  phase: keyof ChristianModeContent['prayerPrompts'],
): string {
  return getChristianModeContent(mode).prayerPrompts[phase];
}

export function getChristianBlessing(mode: ChristianSessionMode): string {
  return getChristianModeContent(mode).blessing;
}
