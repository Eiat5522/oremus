import type { Href } from 'expo-router';

import { CHANTS } from '@/constants/buddhist-prayer/chants';
import type { Chant, ChantCategory } from '@/constants/buddhist-prayer/types';
import { getChantBySlug } from '@/lib/chant-helpers';

export type HomeQuickActionId = 'ar' | 'chant' | 'merit' | 'learn';

export type RouteTarget = Href;

export interface HomeSessionCardState {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  progressLabel: string;
  primaryRoute: RouteTarget;
}

export function resolveARChantSlug(currentChantSlug?: string | null): string | null {
  if (currentChantSlug && getChantBySlug(currentChantSlug)) {
    return currentChantSlug;
  }

  return CHANTS[0]?.slug ?? null;
}

export function getARIntroRoute(currentChantSlug?: string | null): RouteTarget {
  const chantSlug = resolveARChantSlug(currentChantSlug);

  return chantSlug
    ? {
        pathname: '/tradition/buddhist-prayer/ar-intro',
        params: { chantSlug },
      }
    : { pathname: '/tradition/buddhist-prayer/ar-intro' };
}

export function getStandardPreparationRoute(currentChantSlug?: string | null): RouteTarget {
  const chantSlug = currentChantSlug && getChantBySlug(currentChantSlug) ? currentChantSlug : null;

  return chantSlug
    ? {
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantSlug },
      }
    : { pathname: '/tradition/buddhist-prayer/preparation' };
}

export function getQuickActionRoute(
  actionId: HomeQuickActionId,
  currentChantSlug?: string | null,
): RouteTarget {
  switch (actionId) {
    case 'ar':
      return getARIntroRoute(currentChantSlug);
    case 'chant':
      return getStandardPreparationRoute(currentChantSlug);
    case 'merit':
      return {
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantSlug: 'merit-dedication' },
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
  isARMode: boolean;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
}

export function getHomeSessionCardState({
  chant,
  currentVerseIndex,
  isARMode,
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
        params: { chantSlug: chant.slug },
      },
    };
  }

  if (sessionStartedAt) {
    const verseNumber = currentVerseIndex + 1;

    return {
      eyebrow: 'Continue Practice',
      title: chant.title,
      description: `Resume from verse ${verseNumber} of ${chant.verses.length}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: `Verse ${verseNumber}/${chant.verses.length}`,
      primaryRoute: {
        pathname: isARMode
          ? '/tradition/buddhist-prayer/ar-chant'
          : '/tradition/buddhist-prayer/session',
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
      params: { chantSlug: chant.slug },
    },
  };
}
