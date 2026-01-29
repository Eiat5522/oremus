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
    background: mistWhite,
    tint: spiritBlue,
    icon: '#64748b', // Slate 500
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: spiritBlue,
    surface: '#ffffff',
    primary: spiritBlue,
    muted: '#64748b',
  },
  dark: {
    text: '#ffffff',
    background: deepSanctuary,
    tint: spiritBlue,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: spiritBlue,
    surface: abyssSurface,
    primary: spiritBlue,
    muted: '#94a3b8',
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
