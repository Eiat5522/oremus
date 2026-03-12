export type ChantCategory = 'daily' | 'merit' | 'ceremonial' | 'learning';

export type ChantDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type MeritOption = 'family' | 'ancestors' | 'all_beings';

export type ScanStatus = 'idle' | 'scanning' | 'surface_detected';

export type AltarExperienceMode = 'immersive3D' | 'nativeARReady';

export interface ChantVerse {
  id: string;
  thai: string;
  pali: string;
  english: string;
  transliteration?: string;
  meaning?: string;
  audioCue?: string;
  order: number;
}

export interface Chant {
  id: string;
  slug: string;
  title: string;
  titleThai: string;
  subtitle: string;
  category: ChantCategory;
  durationSeconds: number;
  difficulty: ChantDifficulty;
  purpose: string;
  verses: ChantVerse[];
}
