import { Stack } from 'expo-router';

import { ChristianPrayerPhasesScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianFallbackPrayerRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianPrayerPhasesScreen experienceMode="fallback2d" />
    </>
  );
}
