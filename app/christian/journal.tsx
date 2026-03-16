import { Stack } from 'expo-router';

import { ChristianJournalScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianJournalRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianJournalScreen experienceMode="ar" />
    </>
  );
}
