import React from 'react';
import { render } from '@testing-library/react-native';

import { useChristianPrayerAutoAdvance } from '@/hooks/use-christian-prayer-auto-advance';

function AutoAdvanceHarness({
  enabled,
  isPlaying,
  stageKey,
  durationMs,
  onAdvance,
}: {
  enabled: boolean;
  isPlaying: boolean;
  stageKey: string;
  durationMs: number;
  onAdvance: () => void;
}) {
  useChristianPrayerAutoAdvance({ enabled, isPlaying, stageKey, durationMs, onAdvance });
  return null;
}

describe('christian prayer auto advance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('advances automatically when enabled and playing', () => {
    const onAdvance = jest.fn();

    render(
      <AutoAdvanceHarness
        enabled
        isPlaying
        stageKey="peace-scripture:0"
        durationMs={500}
        onAdvance={onAdvance}
      />,
    );

    jest.advanceTimersByTime(500);

    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('does not advance when disabled', () => {
    const onAdvance = jest.fn();

    render(
      <AutoAdvanceHarness
        enabled={false}
        isPlaying
        stageKey="peace-scripture:0"
        durationMs={500}
        onAdvance={onAdvance}
      />,
    );

    jest.advanceTimersByTime(500);

    expect(onAdvance).not.toHaveBeenCalled();
  });
});
