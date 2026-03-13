import { useMemo } from 'react';

import { getChristianPrayerTemplate } from '@/constants/christian-prayer';

import { useChristianPrayerStore } from './use-christian-prayer-store';

export function useChristianPrayerSession() {
  const store = useChristianPrayerStore();

  const currentTemplate = useMemo(
    () => getChristianPrayerTemplate(store.selectedTemplateId),
    [store.selectedTemplateId],
  );
  const currentStage = useMemo(
    () => currentTemplate?.stages[store.currentStageIndex] ?? null,
    [currentTemplate, store.currentStageIndex],
  );

  const totalStages = currentTemplate?.stages.length ?? 0;
  const hasPreviousStage = store.currentStageIndex > 0;
  const hasNextStage = currentTemplate
    ? store.currentStageIndex < currentTemplate.stages.length - 1
    : false;

  const sessionDurationSeconds = useMemo(() => {
    if (!store.sessionStartedAt) {
      return 0;
    }

    const endTime = store.sessionCompletedAt ?? Date.now();
    return Math.max(0, Math.floor((endTime - store.sessionStartedAt) / 1000));
  }, [store.sessionCompletedAt, store.sessionStartedAt]);

  return {
    ...store,
    currentTemplate,
    currentStage,
    totalStages,
    hasPreviousStage,
    hasNextStage,
    stagesCompleted: currentTemplate ? store.currentStageIndex + 1 : 0,
    sessionDurationSeconds,
  };
}
