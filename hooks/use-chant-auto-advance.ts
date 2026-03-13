import { useEffect, useRef } from 'react';

interface ChantAutoAdvanceOptions {
  autoScroll: boolean;
  isPlaying: boolean;
  verseKey: string | number;
  hasNextVerse: boolean;
  durationMs: number;
  onAdvance: () => void;
}

export function useChantAutoAdvance({
  autoScroll,
  isPlaying,
  verseKey,
  hasNextVerse,
  durationMs,
  onAdvance,
}: ChantAutoAdvanceOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!autoScroll || !isPlaying) {
      return;
    }

    timerRef.current = setTimeout(() => {
      if (hasNextVerse) {
        onAdvance();
      }
    }, durationMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoScroll, durationMs, hasNextVerse, isPlaying, onAdvance, verseKey]);
}
