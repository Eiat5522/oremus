import { CHANTS } from '@/constants/buddhist-prayer/chants';
import type { Chant, ChantVerse } from '@/constants/buddhist-prayer/types';

export function getChantBySlug(slug: string): Chant | undefined {
  return CHANTS.find((c) => c.slug === slug);
}

export function getChantById(id: string): Chant | undefined {
  return CHANTS.find((c) => c.id === id);
}

export function getNextVerse(chant: Chant, currentIndex: number): ChantVerse | null {
  if (currentIndex >= chant.verses.length - 1) return null;
  return chant.verses[currentIndex + 1] ?? null;
}

export function getPreviousVerse(chant: Chant, currentIndex: number): ChantVerse | null {
  if (currentIndex <= 0) return null;
  return chant.verses[currentIndex - 1] ?? null;
}

export function calculateSessionProgress(chant: Chant, currentIndex: number): number {
  if (chant.verses.length === 0) return 0;
  return (currentIndex + 1) / chant.verses.length;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function getChantsByCategory(category: string): Chant[] {
  return CHANTS.filter((c) => c.category === category);
}

const FEATURED_CHANTS_LIMIT = 3;

export function getFeaturedChants(): Chant[] {
  return CHANTS.filter((c) => c.category === 'daily').slice(0, FEATURED_CHANTS_LIMIT);
}
