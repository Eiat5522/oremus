import { Stack } from 'expo-router';

import { ChristianCompleteScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianCompleteRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianCompleteScreen experienceMode="ar" />
    </>
  );
}
