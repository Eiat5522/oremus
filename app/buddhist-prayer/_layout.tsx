import { Stack } from 'expo-router';

export default function BuddhistPrayerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
