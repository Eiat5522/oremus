import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type PrayerSessionTimerProps = {
  /** When true the timer counts up from zero. Defaults to true. */
  running?: boolean;
};

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Subtle elapsed-time counter for the prayer session.
 * Intentionally low-contrast so it does not compete with the Kaaba anchor.
 */
export function PrayerSessionTimer({ running = true }: PrayerSessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  return (
    <ThemedText style={styles.timer} accessibilityLabel={`Session time: ${formatElapsed(elapsed)}`}>
      {formatElapsed(elapsed)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 13,
    letterSpacing: 2,
    color: 'rgba(255,240,180,0.38)',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginTop: 6,
  },
});
