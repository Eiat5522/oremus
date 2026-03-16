import { Stack, useLocalSearchParams } from 'expo-router';

import { ChristianExitConfirmScreen } from '@/features/christian-prayer/components/sections/christian-flow-screens';

export default function ChristianExitConfirmRoute() {
  const params = useLocalSearchParams<{ returnTo?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ChristianExitConfirmScreen returnTo={params.returnTo} />
    </>
  );
}
