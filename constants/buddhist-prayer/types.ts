export type ChantCategory = 'daily' | 'merit-making' | 'ceremonial' | 'learning';
export type ChantDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MeritOption = 'family' | 'ancestors' | 'all-beings' | 'custom';
export type ScanStatus = 'idle' | 'scanning' | 'detected' | 'placed';
export type AltarExperienceMode = 'immersive3D' | 'nativeARReady';

export interface ChantVerse {
  id: string;
  order: number;
  thai?: string;
  pali?: string;
  english: string;
  transliteration?: string;
  meaning?: string;
  audioCue?: string;
}

export interface Chant {
  id: string;
  slug: string;
  title: string;
  titleThai?: string;
  subtitle: string;
  category: ChantCategory;
  durationSeconds: number;
  difficulty: ChantDifficulty;
  purpose: string;
  verses: ChantVerse[];
}

export interface ChantSessionState {
  currentChantId: string | null;
  currentVerseIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isAudioEnabled: boolean;
  showMeaning: boolean;
  autoScroll: boolean;
  templeBellEnabled: boolean;
  isARMode: boolean;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
  meritOption: MeritOption | null;
  dedicationNote: string;
  altarPlaced: boolean;
  placementScale: number;
  placementRotation: number;
  scanStatus: ScanStatus;
  isLoading: boolean;
  error: string | null;
}

export interface AltarProps {
  scale?: number;
  rotation?: number;
  showHalo?: boolean;
  showIncenseSmoke?: boolean;
  glowIntensity?: number;
  animated?: boolean;
}
