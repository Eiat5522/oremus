import { Stack } from 'expo-router';

import { ChristianCompleteScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianFallbackCompleteRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianCompleteScreen experienceMode="fallback2d" />
    </>
  );
}
