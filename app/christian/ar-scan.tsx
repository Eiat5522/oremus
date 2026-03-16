import { Stack } from 'expo-router';

import { ChristianArScanScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianArScanRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianArScanScreen />
    </>
  );
}
