import { Stack } from 'expo-router';

import { ChristianArPlaceScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianArPlaceRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianArPlaceScreen />
    </>
  );
}
