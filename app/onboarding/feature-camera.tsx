import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { FEATURE_CAMERA } from '@/constants/onboarding';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeatureCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEnable = async () => {
    try {
      const Camera = await import('expo-camera');
      await Camera.Camera.requestCameraPermissionsAsync();
    } catch {
      // Permission request failed — continue anyway
    }
    router.push('/onboarding/feature-notifications');
  };

  const handleSkip = () => {
    router.push('/onboarding/feature-notifications');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { paddingTop: insets.top + 12 }]}>
        <ProgressDots currentStep={2} />
      </View>
      <FeatureScreen content={FEATURE_CAMERA} onPrimaryCta={handleEnable} onSkip={handleSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101622' },
  dotsContainer: { paddingHorizontal: 24, paddingBottom: 8 },
});
