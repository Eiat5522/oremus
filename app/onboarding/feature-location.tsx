import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React from 'react';
import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { FEATURE_LOCATION } from '@/constants/onboarding';

export default function FeatureLocationScreen() {
  const router = useRouter();

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
    <OnboardingShell currentStep={1}>
      <FeatureScreen content={FEATURE_LOCATION} onPrimaryCta={handleEnable} onSkip={handleSkip} />
    </OnboardingShell>
  );
}
