import { Redirect } from 'expo-router';

/**
 * Legacy onboarding entry point — redirects to the new splash-gate flow.
 * Kept as index.tsx so deep links to /onboarding still work.
 */
export default function OnboardingIndex() {
  return <Redirect href="/onboarding/splash-gate" />;
}
