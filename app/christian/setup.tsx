import { Stack } from 'expo-router';

import { ChristianPrayerSetupScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianSetupRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChristianPrayerSetupScreen />
    </>
  );
}
