import type { ImageSourcePropType } from 'react-native';

export const ONBOARDING_STORAGE_KEY = '@oremus/onboarding-completed-v1';

export type OnboardingStep =
  | 'splash-gate'
  | 'welcome'
  | 'feature-location'
  | 'feature-camera'
  | 'feature-notifications'
  | 'tradition'
  | 'completion';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'splash-gate',
  'welcome',
  'feature-location',
  'feature-camera',
  'feature-notifications',
  'tradition',
  'completion',
];

/** Number of screens shown with progress dots (excludes splash-gate). */
export const PROGRESS_STEP_COUNT = ONBOARDING_STEPS.length - 1; // 6

export interface FeatureScreenContent {
  headline: string;
  description: string;
  bullets: readonly { icon: string; text: string }[];
  ctaLabel: string;
  skipLabel: string;
  /** Screenshot image to display as the hero visual */
  screenshot?: ImageSourcePropType;
}

export const FEATURE_LOCATION: FeatureScreenContent = {
  headline: 'Find Your Direction',
  description: 'Know exactly when and where to pray',
  bullets: [
    { icon: 'location.fill', text: 'Accurate prayer times based on your location' },
    { icon: 'safari.fill', text: 'Real-time Qibla direction compass' },
    { icon: 'bell.badge.fill', text: 'Location-aware prayer reminders' },
  ],
  ctaLabel: 'Enable Location',
  skipLabel: 'Not Now',
  screenshot: require('@/docs/Oremus/Islam/3.1 Islamic - Qibla.png'),
};

export const FEATURE_CAMERA: FeatureScreenContent = {
  headline: 'Immersive Prayer Spaces',
  description: 'Transform any room into a sacred space',
  bullets: [
    { icon: 'cube.transparent.fill', text: 'Place a virtual prayer space in your room' },
    { icon: 'camera.viewfinder', text: 'Augmented reality Qibla compass' },
    { icon: 'sparkles', text: 'Beautiful 3D sacred environments' },
  ],
  ctaLabel: 'Enable Camera',
  skipLabel: 'Not Now',
  screenshot: require('@/docs/Oremus/Buddhist/2. Buddhist - Prayer.png'),
};

export const FEATURE_NOTIFICATIONS: FeatureScreenContent = {
  headline: 'Never Miss a Prayer',
  description: 'Gentle reminders to nurture your practice',
  bullets: [
    { icon: 'bell.fill', text: 'Prayer time reminders throughout the day' },
    { icon: 'heart.fill', text: 'Gentle nudges to maintain your practice' },
    { icon: 'text.book.closed.fill', text: 'Daily spiritual prompts and reflections' },
  ],
  ctaLabel: 'Enable Notifications',
  skipLabel: 'Not Now',
  screenshot: require('@/docs/Oremus/Islam/1. Islamic - Home.png'),
};

export const WELCOME_PILLARS = [
  { icon: 'cube.transparent.fill', text: 'Sacred spaces' },
  { icon: 'hands.sparkles.fill', text: 'Prayer guidance' },
  { icon: 'bell.badge.fill', text: 'Mindful reminders' },
] as const;
