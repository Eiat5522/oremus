import { useMemo } from 'react';

import { buddhistChants } from '@/src/features/buddhistPrayer/data/chants';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';
import { calculateSessionProgress } from '@/src/features/buddhistPrayer/utils/chantHelpers';

export const useChantSession = () => {
  const { currentChantId, currentVerseIndex } = useBuddhistPrayerStore();

  const chant = useMemo(
    () => buddhistChants.find((item) => item.id === currentChantId) ?? buddhistChants[0],
    [currentChantId],
  );

  const currentVerse = chant.verses[currentVerseIndex];
  const progress = calculateSessionProgress(currentVerseIndex, chant.verses.length);

  return {
    chant,
    currentVerse,
    progress,
    totalVerses: chant.verses.length,
    isLastVerse: currentVerseIndex >= chant.verses.length - 1,
  };
};
