import type { Href } from 'expo-router';

import type {
  ChristianPrayerTemplate,
  ChristianSessionCardState,
} from '@/constants/christian-prayer';

type ChristianSessionCardInput = {
  template: ChristianPrayerTemplate | null;
  currentStageIndex: number;
  sessionStartedAt: number | null;
  sessionCompletedAt: number | null;
};

export function getChristianHomeSessionCardState({
  template,
  currentStageIndex,
  sessionStartedAt,
  sessionCompletedAt,
}: ChristianSessionCardInput): ChristianSessionCardState | null {
  if (!template) {
    return null;
  }

  if (sessionCompletedAt) {
    return {
      eyebrow: 'Last Prayer',
      title: template.title,
      description: `Completed ${template.stages.length} stages in your most recent prayer.`,
      primaryLabel: 'Pray Again',
      secondaryLabel: 'Clear',
      progressLabel: 'Completed',
      primaryRoute: {
        pathname: '/tradition/christian-preparation',
        params: { templateId: template.id },
      } as Href,
    };
  }

  if (sessionStartedAt) {
    const stageNumber = currentStageIndex + 1;
    return {
      eyebrow: 'Continue Prayer',
      title: template.title,
      description: `Resume from stage ${stageNumber} of ${template.stages.length}.`,
      primaryLabel: 'Continue',
      secondaryLabel: 'Start Over',
      progressLabel: `Stage ${stageNumber}/${template.stages.length}`,
      primaryRoute: {
        pathname: '/tradition/christian-session',
        params: { templateId: template.id },
      } as Href,
    };
  }

  return null;
}
