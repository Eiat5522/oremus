import { useCallback, useEffect, useRef } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

const IDLE_TIMEOUT_MS = 3000;
const FADE_DURATION_MS = 600;

/**
 * Manages the auto-hide/reveal behavior for prayer session UI overlays.
 *
 * - On mount, controls are visible (opacity 1).
 * - After IDLE_TIMEOUT_MS ms of no interaction they fade to hidden (opacity 0).
 * - Calling `reveal()` (e.g. on tap) resets the timer and fades them back in.
 */
export function usePrayerSessionVisibilityControls() {
  const controlsOpacity = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHideTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: FADE_DURATION_MS });
    }, IDLE_TIMEOUT_MS);
  }, [controlsOpacity]);

  const reveal = useCallback(() => {
    controlsOpacity.value = withTiming(1, { duration: FADE_DURATION_MS });
    startHideTimer();
  }, [controlsOpacity, startHideTimer]);

  // Start the initial hide timer on mount.
  useEffect(() => {
    startHideTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startHideTimer]);

  return { controlsOpacity, reveal };
}
