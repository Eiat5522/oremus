/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const spiritBlue = '#1152d4';
const mistWhite = '#f6f6f8';
const deepSanctuary = '#101622';
const abyssSurface = '#1A2230';

export const Colors = {
  light: {
    text: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500
    textTertiary: '#94a3b8', // Slate 400
    background: mistWhite,
    tint: spiritBlue,
    icon: '#64748b', // Slate 500
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: spiritBlue,
    surface: '#ffffff',
    primary: spiritBlue,
    muted: '#64748b',
    borderLight: '#e2e8f0', // Slate 200
    borderDark: '#cbd5e1', // Slate 300 (used for light-mode subtle controls)
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#94a3b8', // Slate 400
    textTertiary: '#cbd5e1', // Slate 300
    background: deepSanctuary,
    tint: spiritBlue,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: spiritBlue,
    surface: abyssSurface,
    primary: spiritBlue,
    muted: '#94a3b8',
    borderLight: '#1e293b', // Slate 800 (used for dark-mode subtle surfaces)
    borderDark: '#334155', // Slate 700
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    /** Falls back to normal on Android (no system rounded font) */
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
