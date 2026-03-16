import { Stack } from 'expo-router';

import { ChristianBlessingScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianBlessingRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianBlessingScreen experienceMode="ar" />
    </>
  );
}
