import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { FEATURE_LOCATION } from '@/constants/onboarding';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeatureLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEnable = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // Permission request failed — continue anyway
    }
    router.push('/onboarding/feature-camera');
  };

  const handleSkip = () => {
    router.push('/onboarding/feature-camera');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { paddingTop: insets.top + 12 }]}>
        <ProgressDots currentStep={1} />
      </View>
      <FeatureScreen content={FEATURE_LOCATION} onPrimaryCta={handleEnable} onSkip={handleSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101622' },
  dotsContainer: { paddingHorizontal: 24, paddingBottom: 8 },
});
