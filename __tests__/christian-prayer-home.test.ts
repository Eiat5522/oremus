import { getChristianHomeSessionCardState } from '@/lib/christian-prayer-home';

describe('christian prayer home helpers', () => {
  it('builds a continue card for interrupted sessions', () => {
    expect(
      getChristianHomeSessionCardState({
        mode: 'peace',
        currentPhase: 'reflection',
        experienceMode: 'ar',
        sessionStartedAtMs: 123,
        sessionCompletedAtMs: null,
      }),
    ).toEqual({
      eyebrow: 'Continue Prayer',
      title: 'Prayer For Peace',
      description: 'Resume from reflection.',
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: 'reflection',
      primaryRoute: '/christian/reflection',
    });
  });

  it('builds a last-session card for completed prayers', () => {
    expect(
      getChristianHomeSessionCardState({
        mode: 'guidedPrayer',
        currentPhase: 'complete',
        experienceMode: 'fallback2d',
        sessionStartedAtMs: 123,
        sessionCompletedAtMs: 456,
      }),
    ).toEqual({
      eyebrow: 'Last Prayer',
      title: 'Guided Prayer',
      description: 'Your most recent Christian prayer corner session is ready to revisit.',
      primaryLabel: 'View Completion',
      secondaryLabel: 'Start Over',
      progressLabel: 'Completed',
      primaryRoute: '/christian/complete',
    });
  });

  it('returns null when there is no active session', () => {
    expect(
      getChristianHomeSessionCardState({
        mode: null,
        currentPhase: 'idle',
        experienceMode: 'ar',
        sessionStartedAtMs: null,
        sessionCompletedAtMs: null,
      }),
    ).toBeNull();
  });
});
