import { Stack } from 'expo-router';

import { ChristianReflectionScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianFallbackReflectionRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianReflectionScreen experienceMode="fallback2d" />
    </>
  );
}
