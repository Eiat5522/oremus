import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TraditionProvider, useTradition } from '@/hooks/use-tradition';
import { UserProvider } from '@/hooks/use-user';
import { configureNotifications } from '@/lib/notifications';

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
        <Stack.Screen name="tradition/qibla" />
        <Stack.Screen name="tradition/buddhist" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen
          name="tradition/buddhist-session"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/buddhist-prayer"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen name="tradition/christian" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen
          name="tradition/christian-preparation"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/christian-session"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/christian-completion"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/islam-session"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/islam-preparation"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="tradition/islam-completion"
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen name="tradition/general" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <TraditionProvider>
          <RootLayoutNav />
        </TraditionProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
