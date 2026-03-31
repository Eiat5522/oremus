import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { FEATURE_NOTIFICATIONS } from '@/constants/onboarding';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeatureNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEnable = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Permission request failed — continue anyway
    }
    router.push('/onboarding/tradition');
  };

  const handleSkip = () => {
    router.push('/onboarding/tradition');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { paddingTop: insets.top + 12 }]}>
        <ProgressDots currentStep={3} />
      </View>
      <FeatureScreen
        content={FEATURE_NOTIFICATIONS}
        onPrimaryCta={handleEnable}
        onSkip={handleSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101622' },
  dotsContainer: { paddingHorizontal: 24, paddingBottom: 8 },
});
