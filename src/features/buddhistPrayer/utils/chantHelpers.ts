import { buddhistChants } from '@/src/features/buddhistPrayer/data/chants';

export const getChantBySlug = (slug: string) => buddhistChants.find((chant) => chant.slug === slug);

export const getNextVerse = (verseIndex: number, totalVerses: number) =>
  Math.min(verseIndex + 1, totalVerses - 1);

export const getPreviousVerse = (verseIndex: number) => Math.max(verseIndex - 1, 0);

export const calculateSessionProgress = (verseIndex: number, totalVerses: number) => {
  if (totalVerses <= 0) {
    return 0;
  }
  return Math.round(((verseIndex + 1) / totalVerses) * 100);
};
