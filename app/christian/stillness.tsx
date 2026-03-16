import { Stack } from 'expo-router';

import { ChristianStillnessScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianStillnessRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianStillnessScreen experienceMode="ar" />
    </>
  );
}
