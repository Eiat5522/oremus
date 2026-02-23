import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IslamPrayerListSection } from '@/components/islam/islam-prayer-list-section';

export default function PrayersScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen options={{ title: 'Prayers', headerShown: true }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <IslamPrayerListSection />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
