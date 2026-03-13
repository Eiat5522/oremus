import { CHANTS } from '@/constants/buddhist-prayer/chants';
import {
  getCategoryRoute,
  getHomeSessionCardState,
  getQuickActionRoute,
} from '@/lib/buddhist-prayer-home';

describe('buddhist prayer home helpers', () => {
  const chant = CHANTS[0]!;

  it('maps merit and learn quick actions into intentional flows', () => {
    expect(getQuickActionRoute('merit')).toEqual({
      pathname: '/tradition/buddhist-prayer/preparation',
      params: { chantSlug: 'merit-dedication' },
    });

    expect(getQuickActionRoute('learn')).toEqual({
      pathname: '/tradition/buddhist-prayer/library',
      params: { intent: 'learn' },
    });
  });

  it('maps category cards to filtered library routes', () => {
    expect(getCategoryRoute('daily')).toEqual({
      pathname: '/tradition/buddhist-prayer/library',
      params: { category: 'daily' },
    });
  });

  it('builds a continue card for interrupted sessions', () => {
    expect(
      getHomeSessionCardState({
        chant,
        currentVerseIndex: 1,
        sessionStartedAt: 123,
        sessionCompletedAt: null,
      }),
    ).toEqual({
      eyebrow: 'Continue Practice',
      title: chant.title,
      description: `Resume from verse 2 of ${chant.verses.length}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: `Verse 2/${chant.verses.length}`,
      primaryRoute: {
        pathname: '/tradition/buddhist-prayer/session',
      },
    });
  });

  it('builds a last-session card for completed chanting', () => {
    expect(
      getHomeSessionCardState({
        chant,
        currentVerseIndex: chant.verses.length - 1,
        sessionStartedAt: 123,
        sessionCompletedAt: 456,
      }),
    ).toEqual({
      eyebrow: 'Last Session',
      title: chant.title,
      description: `Completed ${chant.verses.length} verses in your most recent practice.`,
      primaryLabel: 'Chant Again',
      secondaryLabel: 'Clear',
      progressLabel: 'Completed',
      primaryRoute: {
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantSlug: chant.slug },
      },
    });
  });
});
