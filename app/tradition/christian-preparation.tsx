import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { resolveChristianModeFromLegacyTemplate } from '@/features/christian-prayer/services/christianSession.service';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

export default function ChristianPreparationLegacyRoute() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const createDraftSession = useChristianSessionStore((state) => state.createDraftSession);
  const updateSetupSelections = useChristianSessionStore((state) => state.updateSetupSelections);

  useEffect(() => {
    try {
      const mode = resolveChristianModeFromLegacyTemplate(templateId);
      createDraftSession(mode);
      updateSetupSelections({ mode });
      router.replace('/christian/setup' as never);
    } catch (error) {
      console.error('Failed to initialize Christian preparation route.', error);
      router.replace('/christian' as never);
    }
  }, [createDraftSession, router, templateId, updateSetupSelections]);

  return <Stack.Screen options={{ headerShown: false }} />;
}
