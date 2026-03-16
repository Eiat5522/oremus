import { Stack } from 'expo-router';

import { ChristianFallbackStartScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianFallbackIndexRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianFallbackStartScreen />
    </>
  );
}
