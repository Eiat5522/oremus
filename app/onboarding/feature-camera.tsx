import { useRouter } from 'expo-router';
import React from 'react';

import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { FEATURE_CAMERA } from '@/constants/onboarding';

export default function FeatureCameraScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    try {
      const Camera = await import('expo-camera');
      await Camera.Camera.requestCameraPermissionsAsync();
    } catch {
      // Permission request failed — continue anyway
    }
    router.replace('/onboarding/feature-notifications');
  };

  const handleSkip = () => {
    router.replace('/onboarding/feature-notifications');
  };

  return (
    <OnboardingShell currentStep={2}>
      <FeatureScreen content={FEATURE_CAMERA} onPrimaryCta={handleEnable} onSkip={handleSkip} />
    </OnboardingShell>
  );
}
