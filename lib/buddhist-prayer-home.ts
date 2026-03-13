import type { Chant, ChantCategory } from '@/constants/buddhist-prayer/types';

export type HomeQuickActionId = 'ar' | 'chant' | 'merit' | 'learn';

export interface RouteTarget {
  pathname: string;
  params?: Record<string, string>;
}

export interface HomeSessionCardState {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  progressLabel: string;
  primaryRoute: RouteTarget;
}

export function getQuickActionRoute(actionId: HomeQuickActionId): RouteTarget {
  switch (actionId) {
    case 'ar':
      return { pathname: '/tradition/buddhist-prayer/ar-intro' };
    case 'chant':
      return {
        pathname: '/tradition/buddhist-prayer/library',
        params: { category: 'daily' },
      };
    case 'merit':
      return {
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantId: 'merit-dedication' },
      };
    case 'learn':
      return {
        pathname: '/tradition/buddhist-prayer/library',
        params: { intent: 'learn' },
      };
  }
}

export function getCategoryRoute(category: ChantCategory): RouteTarget {
  return {
    pathname: '/tradition/buddhist-prayer/library',
    params: { category },
  };
}

interface SessionCardArgs {
  chant: Chant | null;
  currentVerseIndex: number;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
}

export function getHomeSessionCardState({
  chant,
  currentVerseIndex,
  sessionStartedAt,
  sessionCompletedAt,
}: SessionCardArgs): HomeSessionCardState | null {
  if (!chant) {
    return null;
  }

  if (sessionCompletedAt) {
    return {
      eyebrow: 'Last Session',
      title: chant.title,
      description: `Completed ${chant.verses.length} verses in your most recent practice.`,
      primaryLabel: 'Chant Again',
      secondaryLabel: 'Clear',
      progressLabel: 'Completed',
      primaryRoute: {
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantId: chant.id },
      },
    };
  }

  if (sessionStartedAt) {
    const verseNumber = Math.min(currentVerseIndex + 1, chant.verses.length);

    return {
      eyebrow: 'Continue Practice',
      title: chant.title,
      description: `Resume from verse ${verseNumber} of ${chant.verses.length}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: `Verse ${verseNumber}/${chant.verses.length}`,
      primaryRoute: {
        pathname: '/tradition/buddhist-prayer/session',
      },
    };
  }

  return {
    eyebrow: 'Ready to Begin',
    title: chant.title,
    description: 'Your preparation is saved and ready when you return.',
    primaryLabel: 'Resume Preparation',
    secondaryLabel: 'Reset',
    progressLabel: 'Prepared',
    primaryRoute: {
      pathname: '/tradition/buddhist-prayer/preparation',
      params: { chantId: chant.id },
    },
  };
}
