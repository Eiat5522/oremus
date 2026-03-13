import { useEffect, useRef } from 'react';

interface ChristianPrayerAutoAdvanceOptions {
  enabled: boolean;
  isPlaying: boolean;
  stageKey: string | number;
  durationMs: number;
  onAdvance: () => void;
}

export function useChristianPrayerAutoAdvance({
  enabled,
  isPlaying,
  stageKey,
  durationMs,
  onAdvance,
}: ChristianPrayerAutoAdvanceOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!enabled || !isPlaying) {
      return;
    }

    timerRef.current = setTimeout(() => {
      onAdvance();
    }, durationMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [durationMs, enabled, isPlaying, onAdvance, stageKey]);
}
