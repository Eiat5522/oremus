import { Stack } from 'expo-router';

import { ChristianPrayerStartScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianIndexRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianPrayerStartScreen />
    </>
  );
}
