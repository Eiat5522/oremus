import type { Href } from 'expo-router';
import type { ImageSourcePropType } from 'react-native';

import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { Tradition } from '@/constants/traditions';

export type TraditionThemeKey = Tradition | 'general';

type HomeActionItem = {
  id: string;
  label: string;
  icon: IconSymbolName;
  route: Href;
};

export type TraditionUiTheme = {
  greeting: string;
  subtitle: string;
  ctaLabel: string;
  ctaRoute: Href;
  textColor: string;
  subtitleColor: string;
  ctaGradient: [string, string];
  actionCardColor: string;
  actionCardBorderColor: string;
  actionTextColor: string;
  actionIconColor: string;
  backgroundImage: ImageSourcePropType;
  overlayGradient: [string, string, string];
  tabBarColor: string;
  tabBarBorderColor: string;
  tabActiveTint: string;
  tabInactiveTint: string;
  actions: HomeActionItem[];
};

const THEMES: Record<TraditionThemeKey, TraditionUiTheme> = {
  general: {
    greeting: 'Welcome Back',
    subtitle: 'Ready to find your focus?',
    ctaLabel: 'Begin Session',
    ctaRoute: '/active-session',
    textColor: '#F7F8FF',
    subtitleColor: 'rgba(243, 244, 255, 0.9)',
    ctaGradient: ['#3F4C7A', '#1B264A'],
    actionCardColor: 'rgba(24, 35, 68, 0.62)',
    actionCardBorderColor: 'rgba(223, 230, 255, 0.25)',
    actionTextColor: '#F5F7FF',
    actionIconColor: '#D8E3FF',
    backgroundImage: require('@/assets/images/background/general-waterpaint.jpg'),
    overlayGradient: ['rgba(14, 20, 42, 0.08)', 'rgba(12, 17, 40, 0.55)', 'rgba(8, 11, 24, 0.88)'],
    tabBarColor: 'rgba(20, 29, 58, 0.8)',
    tabBarBorderColor: 'rgba(228, 233, 255, 0.2)',
    tabActiveTint: '#F4F6FF',
    tabInactiveTint: 'rgba(211, 220, 255, 0.65)',
    actions: [
      { id: 'history', label: 'History', icon: 'hourglass', route: '/tradition/general' },
      {
        id: 'guided',
        label: 'Guided Sessions',
        icon: 'brain.headset',
        route: '/tradition/general',
      },
      { id: 'settings', label: 'Settings', icon: 'settings', route: '/profile' },
    ],
  },
  islam: {
    greeting: 'Assalamu Alaikum',
    subtitle: 'Take a moment for prayer.',
    ctaLabel: 'Begin Session',
    ctaRoute: '/tradition/islam-session',
    textColor: '#F4FFFC',
    subtitleColor: 'rgba(229, 255, 245, 0.9)',
    ctaGradient: ['#1D7A63', '#0C4B3A'],
    actionCardColor: 'rgba(9, 63, 48, 0.6)',
    actionCardBorderColor: 'rgba(179, 242, 223, 0.25)',
    actionTextColor: '#EBFFF7',
    actionIconColor: '#A8EED6',
    backgroundImage: require('@/assets/images/background/islam-waterpaint.png'),
    overlayGradient: ['rgba(9, 46, 35, 0.08)', 'rgba(8, 52, 40, 0.45)', 'rgba(4, 34, 26, 0.84)'],
    tabBarColor: 'rgba(8, 52, 40, 0.82)',
    tabBarBorderColor: 'rgba(190, 244, 227, 0.2)',
    tabActiveTint: '#E9FFF7',
    tabInactiveTint: 'rgba(181, 234, 216, 0.7)',
    actions: [
      { id: 'prayer-times', label: 'Prayer Times', icon: 'timer', route: '/prayers' },
      { id: 'qibla', label: 'Qibla', icon: 'location.fill', route: '/qibla' },
    ],
  },
  christianity: {
    greeting: 'Welcome Back',
    subtitle: 'Take a moment for prayer.',
    ctaLabel: 'Start Prayer Session',
    ctaRoute: '/active-session',
    textColor: '#FFF7EB',
    subtitleColor: 'rgba(255, 240, 220, 0.9)',
    ctaGradient: ['#7A533B', '#4B2F20'],
    actionCardColor: 'rgba(69, 43, 29, 0.6)',
    actionCardBorderColor: 'rgba(255, 226, 187, 0.24)',
    actionTextColor: '#FFF1DD',
    actionIconColor: '#F0D1A0',
    backgroundImage: require('@/assets/images/background/christianity-waterpaint.png'),
    overlayGradient: ['rgba(81, 48, 25, 0.08)', 'rgba(83, 48, 26, 0.46)', 'rgba(52, 30, 18, 0.86)'],
    tabBarColor: 'rgba(68, 40, 25, 0.8)',
    tabBarBorderColor: 'rgba(255, 220, 178, 0.2)',
    tabActiveTint: '#FFF0DC',
    tabInactiveTint: 'rgba(244, 211, 171, 0.7)',
    actions: [
      { id: 'bible', label: 'Bible', icon: 'book.fill', route: '/tradition/christian' },
      {
        id: 'reflection',
        label: 'Daily Reflection',
        icon: 'sun.max.fill',
        route: '/tradition/general',
      },
      { id: 'settings', label: 'Settings', icon: 'settings', route: '/profile' },
    ],
  },
  buddhism: {
    greeting: 'Welcome Back',
    subtitle: 'Find a moment for mindfulness.',
    ctaLabel: 'Begin Session',
    ctaRoute: '/active-session',
    textColor: '#33200E',
    subtitleColor: 'rgba(92, 54, 30, 0.92)',
    ctaGradient: ['#B8763E', '#744321'],
    actionCardColor: 'rgba(127, 74, 40, 0.62)',
    actionCardBorderColor: 'rgba(255, 224, 181, 0.3)',
    actionTextColor: '#FFF2E0',
    actionIconColor: '#FFD4A0',
    backgroundImage: require('@/assets/images/background/buddhism-waterpaint.png'),
    overlayGradient: [
      'rgba(175, 110, 57, 0.06)',
      'rgba(178, 105, 45, 0.34)',
      'rgba(105, 59, 27, 0.72)',
    ],
    tabBarColor: 'rgba(111, 63, 33, 0.76)',
    tabBarBorderColor: 'rgba(255, 221, 179, 0.25)',
    tabActiveTint: '#FFF0DC',
    tabInactiveTint: 'rgba(255, 214, 161, 0.72)',
    actions: [
      { id: 'teachings', label: 'Teachings', icon: 'spa', route: '/tradition/buddhist' },
      { id: 'reflection', label: 'Meditation', icon: 'flower.fill', route: '/tradition/general' },
      { id: 'settings', label: 'Settings', icon: 'settings', route: '/profile' },
    ],
  },
};

export function getTraditionUiTheme(tradition: Tradition | null): TraditionUiTheme {
  if (tradition === null) {
    return THEMES.general;
  }
  return THEMES[tradition];
}
