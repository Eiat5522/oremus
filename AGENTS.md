# Repository Guidelines

## Project Structure & Module Organization

- `app/` contains Expo Router screens and layouts (file-based routing). Route groups live in folders like `app/(tabs)/` and feature areas such as `app/onboarding/`, `app/tradition/`, and `app/active-session/`.
- `components/` holds shared UI components; `hooks/` contains reusable React hooks; `constants/` stores app constants.
- `assets/` contains images and other static files; `docs/` and `DESIGN.md` hold product/design notes.
- Native project folders `ios/` and `android/` are present for dev builds.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run start` runs the Expo dev server (same as `npx expo start`).
- `npm run ios` / `npm run android` builds and runs native dev clients.
- `npm run web` runs the web build via Expo.
- `npm run lint` runs ESLint (Expo config).
- `npm test` runs Jest in watch mode.
- `npm run reset-project` resets the starter template into `app-example/` and clears `app/`.

## Coding Style & Naming Conventions

- TypeScript is used throughout; keep files in `*.ts`/`*.tsx`.
- Follow ESLint via `eslint-config-expo` (see `eslint.config.js`).
- Use file-based routing conventions for screens (e.g., `_layout.tsx`, `modal.tsx`).
- Prefer descriptive, feature-scoped component names (e.g., `TraditionHeader.tsx`).

## Testing Guidelines

- Jest is configured with `jest-expo` and `@testing-library/react-native`.
- If you add tests, place them in `__tests__/` or use `*.test.tsx` naming.
- Run tests with `npm test`; keep tests fast and focused on UI behavior.

## Commit & Pull Request Guidelines

- Recent commits mostly follow Conventional Commits (e.g., `feat: ...`, `feat(scope): ...`). Use that style for new commits.
- Keep commit messages imperative and scoped to a single change.
- PRs should include a clear description, linked issues if applicable, and screenshots for UI changes (before/after when helpful).

## Configuration & Environment Notes

- App configuration lives in `app.config.ts` and `app.json`; build settings are in `eas.json`.
- Avoid committing secrets; use environment variables or Expo config plugins if needed.

## Agent-Specific Instructions

- Agent skills and automation live under `.agents/skills/` and `skills/`. If updating automation, document changes in `docs/` or `DESIGN.md` as appropriate.
