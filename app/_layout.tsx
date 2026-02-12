import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TraditionProvider, useTradition } from '@/hooks/use-tradition';
import { UserProvider } from '@/hooks/use-user';

export const unstable_settings = {
  initialRouteName: 'onboarding/index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { tradition, isLoading } = useTradition();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={tradition ? '(tabs)' : 'onboarding/index'}
      >
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="active-session/index" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="tradition/qibla" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tradition/buddhist" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tradition/buddhist-session" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="tradition/christian" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tradition/christian-session" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="tradition/general" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <TraditionProvider>
        <RootLayoutNav />
      </TraditionProvider>
    </UserProvider>
  );
}
