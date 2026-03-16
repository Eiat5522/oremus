import { Stack } from 'expo-router';

import { ChristianArIntroScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianArIntroRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianArIntroScreen />
    </>
  );
}
