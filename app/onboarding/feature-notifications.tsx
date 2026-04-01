import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React from 'react';

import { FeatureScreen } from '@/components/onboarding/feature-screen';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { FEATURE_NOTIFICATIONS } from '@/constants/onboarding';

export default function FeatureNotificationsScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Permission request failed — continue anyway
    }
    router.push('/onboarding/choose-path' as any);
  };

  const handleSkip = () => {
    router.push('/onboarding/choose-path' as any);
  };

  return (
    <OnboardingShell currentStep={3}>
      <FeatureScreen
        content={FEATURE_NOTIFICATIONS}
        onPrimaryCta={handleEnable}
        onSkip={handleSkip}
      />
    </OnboardingShell>
  );
}
