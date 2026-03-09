import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IslamPrayerListSection } from '@/components/islam/islam-prayer-list-section';

export default function PrayersScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen options={{ title: 'Prayers', headerShown: false }} />
      <IslamPrayerListSection />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
