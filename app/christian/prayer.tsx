import { Stack } from 'expo-router';

import { ChristianPrayerPhasesScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianPrayerRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianPrayerPhasesScreen experienceMode="ar" />
    </>
  );
}
