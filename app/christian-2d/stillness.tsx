import { Stack } from 'expo-router';

import { ChristianStillnessScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianFallbackStillnessRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianStillnessScreen experienceMode="fallback2d" />
    </>
  );
}
