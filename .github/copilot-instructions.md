# Copilot Instructions

## Project overview

- Expo + Expo Router app with file-based routing; entry point is expo-router/entry in [package.json](../package.json).
- Root navigation is a Stack with a Tabs group and a modal route in [app/\_layout.tsx](../app/_layout.tsx).
- The Tabs navigator and tab icons live in app/(tabs)/\_layout.tsx.

## Architecture and UI patterns

- Screens are route files under app/, for example app/(tabs)/index.tsx and app/(tabs)/explore.tsx.
- Theming is handled by `useColorScheme()` and `useThemeColor()`; see [hooks/use-color-scheme.ts](../hooks/use-color-scheme.ts) and [hooks/use-theme-color.ts](../hooks/use-theme-color.ts).
- Shared theme tokens are in [constants/theme.ts](../constants/theme.ts); prefer Colors and Fonts over hardcoded values.
- Use the local UI primitives like `ThemedText` and `ThemedView` as in [components/themed-text.tsx](../components/themed-text.tsx) and [components/themed-view.tsx](../components/themed-view.tsx).
- Images use expo-image; follow the pattern in app/(tabs)/index.tsx.

## Conventions

- Import alias @/ resolves to repo root; see [tsconfig.json](../tsconfig.json).
- Keep route groups and layouts aligned with Expo Router conventions in app/.
- This project enables React Compiler and typed routes in [app.json](../app.json); avoid patterns that break compiler assumptions.

## Developer workflows

```bash
npm install
npx expo start
```

- Platform shortcuts: npm run android, npm run ios, npm run web in [package.json](../package.json).
- Lint: npm run lint in [package.json](../package.json).
- Reset starter content: npm run reset-project in [scripts/reset-project.js](../scripts/reset-project.js).

## Agent skill guidance

- Follow React Native performance rules in [skills/vercel-react-native-skills/AGENTS.md](skills/vercel-react-native-skills/AGENTS.md), especially no falsy && rendering, wrap strings in Text, and list performance rules.
- Prefer native navigators, Pressable, and expo-image as documented in the same skill guide.
- Use composition patterns over boolean-prop variants; see [skills/vercel-composition-patterns/AGENTS.md](skills/vercel-composition-patterns/AGENTS.md).
