import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import {
  getChristianResumeRoute,
  resolveChristianModeFromLegacyTemplate,
} from '@/features/christian-prayer/services/christianSession.service';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

export default function ChristianSessionLegacyRoute() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const {
    createDraftSession,
    currentPhase,
    currentRoute,
    experienceMode,
    isCompleted,
    isDraft,
    updateSetupSelections,
  } = useChristianSessionStore();

  useEffect(() => {
    if (!currentRoute && isDraft) {
      const mode = resolveChristianModeFromLegacyTemplate(templateId);
      createDraftSession(mode);
      updateSetupSelections({ mode });
      router.replace('/christian/setup' as never);
      return;
    }

    router.replace(
      getChristianResumeRoute({
        currentRoute,
        experienceMode,
        currentPhase,
        isCompleted,
        isDraft,
      }) as never,
    );
  }, [
    createDraftSession,
    currentPhase,
    currentRoute,
    experienceMode,
    isCompleted,
    isDraft,
    router,
    templateId,
    updateSetupSelections,
  ]);

  return <Stack.Screen options={{ headerShown: false }} />;
}
