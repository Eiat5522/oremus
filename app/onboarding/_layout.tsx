import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  initialRouteName: 'splash-gate',
};

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#101622' },
        animation: 'slide_from_right',
      }}
      initialRouteName="splash-gate"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="splash-gate" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="feature-location" />
      <Stack.Screen name="feature-camera" />
      <Stack.Screen name="feature-notifications" />
      <Stack.Screen name="tradition" />
      <Stack.Screen name="completion" />
    </Stack>
  );
}
