import type { Href } from 'expo-router';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type ChristianPrayerStageKind =
  | 'scripture'
  | 'reflection'
  | 'prayer'
  | 'stillness'
  | 'blessing';

export interface ChristianScriptureExcerpt {
  reference: string;
  text: string;
}

export interface ChristianPrayerStage {
  id: string;
  kind: ChristianPrayerStageKind;
  title: string;
  body: string;
  scripture?: ChristianScriptureExcerpt;
  reflectionPrompt?: string;
  durationSeconds?: number;
}

export interface ChristianPrayerTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  estimatedMinutes: number;
  icon: IconSymbolName;
  heroScripture: ChristianScriptureExcerpt;
  intentionPrompt: string;
  closingBlessing: string;
  stages: ChristianPrayerStage[];
}

export interface ChristianDailyScripture extends ChristianScriptureExcerpt {
  id: string;
  title: string;
  category: string;
}

export interface ChristianPrayerPreferenceState {
  autoAdvance: boolean;
  ambientAudioEnabled: boolean;
  showScriptureFirst: boolean;
}

export interface ChristianSessionCardState {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  progressLabel: string;
  primaryRoute: Href;
}
