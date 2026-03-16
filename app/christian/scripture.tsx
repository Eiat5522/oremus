import { Stack } from 'expo-router';

import { ChristianScriptureScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianScriptureRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianScriptureScreen experienceMode="ar" />
    </>
  );
}
