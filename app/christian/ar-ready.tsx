import { Stack } from 'expo-router';

import { ChristianArReadyScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianArReadyRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianArReadyScreen />
    </>
  );
}
