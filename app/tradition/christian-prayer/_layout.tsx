import { Stack } from 'expo-router';
import { CHRISTIAN_PRAYER_THEME as T } from '@/constants/christian-prayer/theme';

export default function ChristianPrayerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ar-scan" options={{ animation: 'fade' }} />
      <Stack.Screen name="ar-placement" options={{ animation: 'fade' }} />
    </Stack>
  );
}
