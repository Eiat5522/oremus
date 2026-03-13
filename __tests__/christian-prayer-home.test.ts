import { getChristianPrayerTemplate } from '@/constants/christian-prayer';
import { getChristianHomeSessionCardState } from '@/lib/christian-prayer-home';

describe('christian prayer home helpers', () => {
  const template = getChristianPrayerTemplate('peace-in-christ')!;

  it('builds a continue card for interrupted sessions', () => {
    expect(
      getChristianHomeSessionCardState({
        template,
        currentStageIndex: 2,
        sessionStartedAt: 123,
        sessionCompletedAt: null,
      }),
    ).toEqual({
      eyebrow: 'Continue Prayer',
      title: template.title,
      description: `Resume from stage 3 of ${template.stages.length}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: `Stage 3/${template.stages.length}`,
      primaryRoute: {
        pathname: '/tradition/christian-session',
        params: { templateId: template.id },
      },
    });
  });

  it('builds a last-session card for completed prayers', () => {
    expect(
      getChristianHomeSessionCardState({
        template,
        currentStageIndex: template.stages.length - 1,
        sessionStartedAt: 123,
        sessionCompletedAt: 456,
      }),
    ).toEqual({
      eyebrow: 'Last Prayer',
      title: template.title,
      description: `Completed ${template.stages.length} stages in your most recent prayer.`,
      primaryLabel: 'Pray Again',
      secondaryLabel: 'Clear',
      progressLabel: 'Completed',
      primaryRoute: {
        pathname: '/tradition/christian-preparation',
        params: { templateId: template.id },
      },
    });
  });

  it('returns null when no template has an active or recent session', () => {
    expect(
      getChristianHomeSessionCardState({
        template,
        currentStageIndex: 0,
        sessionStartedAt: null,
        sessionCompletedAt: null,
      }),
    ).toBeNull();
  });
});
