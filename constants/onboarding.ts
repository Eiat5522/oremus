import type { ImageSourcePropType } from 'react-native';

export const ONBOARDING_STORAGE_KEY = '@oremus/onboarding-completed-v1';

export type OnboardingStep =
  | 'splash-gate'
  | 'welcome'
  | 'feature-location'
  | 'feature-camera'
  | 'feature-notifications'
  | 'choose-path';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'splash-gate',
  'welcome',
  'feature-location',
  'feature-camera',
  'feature-notifications',
  'choose-path',
];

/** Number of screens shown with progress dots (excludes splash-gate). */
export const PROGRESS_STEP_COUNT = 5;

export interface FeatureScreenContent {
  headline: string;
  description: string;
  bullets: readonly { icon: string; text: string }[];
  ctaLabel: string;
  skipLabel: string;
  badgeLabel?: string;
  helperText?: string;
  /** Screenshot image to display as the hero visual */
  screenshot?: ImageSourcePropType;
}

export const FEATURE_LOCATION: FeatureScreenContent = {
  headline: 'Personalize prayer times',
  description:
    'Use location when you are ready. It helps calculate prayer times and Qibla, and you can keep going without it.',
  bullets: [
    { icon: 'location.fill', text: 'Accurate prayer times based on your location' },
    { icon: 'safari.fill', text: 'Real-time Qibla direction compass' },
    { icon: 'bell.badge.fill', text: 'Location-aware prayer reminders' },
  ],
  ctaLabel: 'Allow location',
  skipLabel: 'Continue without',
  badgeLabel: 'Optional',
  helperText: 'You can turn this on later in Settings whenever you want.',
  screenshot: require('@/docs/Oremus/Islam/3.1 Islamic - Qibla.png'),
};

export const FEATURE_CAMERA: FeatureScreenContent = {
  headline: 'Bring prayer spaces to life',
  description:
    'Camera access is only used for immersive features. You can skip this now and enable it later if you want the AR experience.',
  bullets: [
    { icon: 'cube.transparent.fill', text: 'Place a virtual prayer space in your room' },
    { icon: 'camera.viewfinder', text: 'Augmented reality Qibla compass' },
    { icon: 'sparkles', text: 'Beautiful 3D sacred environments' },
  ],
  ctaLabel: 'Allow camera',
  skipLabel: 'Continue without',
  badgeLabel: 'Optional',
  helperText: 'No camera prompt until you choose an AR feature later.',
  screenshot: require('@/docs/Oremus/Buddhist/2. Buddhist - Prayer.png'),
};

export const FEATURE_NOTIFICATIONS: FeatureScreenContent = {
  headline: 'Gentle reminders, on your terms',
  description:
    'Notifications help nudge your practice, but they are completely optional. You can finish setup now and enable them later.',
  bullets: [
    { icon: 'bell.fill', text: 'Prayer time reminders throughout the day' },
    { icon: 'heart.fill', text: 'Gentle nudges to maintain your practice' },
    { icon: 'text.book.closed.fill', text: 'Daily spiritual prompts and reflections' },
  ],
  ctaLabel: 'Allow notifications',
  skipLabel: 'Finish setup',
  badgeLabel: 'Optional',
  helperText: 'We only ask once you decide reminders would be helpful.',
  screenshot: require('@/docs/Oremus/Islam/1. Islamic - Home.png'),
};

export const WELCOME_PILLARS = [
  { icon: 'cube.transparent.fill', text: 'Sacred spaces' },
  { icon: 'hands.sparkles', text: 'Prayer guidance' },
  { icon: 'bell.badge.fill', text: 'Mindful reminders' },
] as const;
