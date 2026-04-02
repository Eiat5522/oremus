import 'react-native-reanimated';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useOnboarding } from '@/hooks/use-onboarding';
import { TraditionProvider, useTradition } from '@/hooks/use-tradition';
import { UserProvider } from '@/hooks/use-user';
import { configureNotifications } from '@/lib/notifications';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { tradition, isLoading: traditionLoading } = useTradition();
  const segments = useSegments();
  const {
    isOnboardingCompleted,
    isLoading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding();

  const isLoading = traditionLoading || onboardingLoading;

  // Migration: existing users who already have a tradition selected but pre-date
  // the onboarding feature (no flag in AsyncStorage). Auto-mark as completed so
  // they are not trapped in the onboarding flow.
  useEffect(() => {
    if (!isLoading && tradition && !isOnboardingCompleted) {
      completeOnboarding();
    }
  }, [isLoading, tradition, isOnboardingCompleted, completeOnboarding]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  const shouldOnboard = !isOnboardingCompleted || !tradition;
  const isInOnboarding = segments[0] === 'onboarding';

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        {shouldOnboard && !isInOnboarding && <Redirect href="/onboarding/splash-gate" />}
        {!shouldOnboard && isInOnboarding && <Redirect href="/(tabs)" />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
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
          <Stack.Screen name="christian" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="christian-2d" options={{ presentation: 'fullScreenModal' }} />
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
          <Stack.Screen
            name="settings/select-tradition"
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void configureNotifications();
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
