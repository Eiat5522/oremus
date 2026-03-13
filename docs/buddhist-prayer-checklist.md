# Buddhist Prayer Checklist

Last updated: March 13, 2026

Source of comparison:

- `prd.md`
- `app/tradition/buddhist-prayer/`
- `components/buddhist-prayer/`
- `constants/buddhist-prayer/`
- `hooks/use-buddhist-prayer-store.ts`
- `hooks/use-chant-session.ts`
- `hooks/use-altar-experience.ts`
- `hooks/use-audio-prayer.ts`
- `package.json`

## Current Status Summary

The repo already contains a substantial Buddhist prayer scaffold:

- Standard route flow exists: Home, Library, Preparation, Session, Merit, Completion.
- AR-style route flow exists: Intro, Scan, Placement, Preparation, Chant, Merit, Completion.
- Shared Buddhist theme, chant data, store, and reusable UI components exist.
- Zustand-based local session state is already implemented.
- Audio architecture now aligns with the app's `expo-audio` usage.
- Placeholder production asset folders exist under `assets/models/`, `assets/animations/`, and `assets/audio/`.
- The AR altar uses a composed native 3D scene where supported and a safe in-app fallback scene otherwise.

The main gaps against the PRD are:

- 3D altar is still a placeholder image-based component.
- Required 3D and motion dependencies from the PRD are not installed.
- Audio exists only as a partial hook and is not fully integrated into session screens.
- Several PRD UX details are still missing or incomplete.
- There are no Buddhist-specific tests yet.

Legend:

- `[x]` Present or substantially implemented
- `[ ]` Still required

## Phase 0: Architecture and Product Alignment

- [ ] Decide whether the new Buddhist prayer module replaces the legacy Buddhist mantra flow in `app/tradition/buddhist.tsx` and `app/tradition/buddhist-session.tsx`, or whether both experiences remain intentionally separate.
- [ ] Consolidate Buddhist module ownership into one clearer feature boundary or document the current split across `app`, `components`, `constants`, `hooks`, and `lib`.
- [ ] Add an explicit altar adapter file such as `altarSceneAdapter.ts` or equivalent, instead of keeping swap logic only inside `useAltarExperience`.
- [ ] Wire the store's `isLoading` and `error` fields into real UI states across scan, placement, session, and completion.
- [ ] Add analytics hook points for module entry, chant start, chant completion, AR fallback used, model load failure, and audio load failure.

## Phase 1: Standard Prayer Flow

- [x] Home route exists.
- [x] Library route exists.
- [x] Preparation route exists.
- [x] Session route exists.
- [x] Merit route exists.
- [x] Completion route exists.
- [ ] Add the missing Home categories section required by the PRD.
- [ ] Add the missing continue or last-session card on Home.
- [ ] Fix quick actions so `Merit` and `Learn` are intentional flows rather than shortcuts into disconnected screens.
- [ ] Add the optional dedication note input placeholder on the merit screen.
- [ ] Verify back navigation, reset behavior, and interrupted-session behavior across the full standard flow.

## Phase 2: Chant Data and Session Logic

- [x] Chant schema exists with `id`, `slug`, `title`, `titleThai`, `subtitle`, `category`, `durationSeconds`, `difficulty`, `purpose`, and `verses`.
- [x] Verse schema exists with `id`, `order`, `thai`, `pali`, `english`, `transliteration`, `meaning`, and optional `audioCue`.
- [x] Seed data exists for `Namo Tassa`, `Itipiso`, `Triple Gem Refuge`, and `Merit Dedication`.
- [x] Helper functions exist for chant lookup, next verse, previous verse, and progress calculation.
- [ ] Use slug-based navigation where appropriate, since the schema supports it but the routes currently use `chantId`.
- [ ] Implement the advertised `autoScroll` behavior or remove or rename the toggle so the UI matches actual behavior.
- [ ] Decide whether the session should display only one verse at a time or support a continuous chant-reading mode.
- [ ] Add persistence for current or last chant if the Home continue-session card is part of launch scope.
- [ ] Add a localization-safe content strategy for Thai, Pali, transliteration, and English text rendering.

## Phase 3: Audio Integration

- [x] A Buddhist audio hook exists in `hooks/use-audio-prayer.ts`.
- [ ] Connect `useAudioPrayer` into `app/tradition/buddhist-prayer/session.tsx`.
- [ ] Connect `useAudioPrayer` into `app/tradition/buddhist-prayer/ar-chant.tsx`.
- [ ] Replace placeholder audio assets with Buddhist-specific chant and temple bell assets.
- [ ] Decide whether playback is ambient session audio or verse-synced narration and implement one coherent model.
- [ ] Add bell playback timing rules for session start, verse transitions, and/or completion.
- [ ] Define how `audioCue` is used at the verse level or remove it from the schema if it is not needed.

## Phase 4: AR Flow and Fallback

- [x] AR Intro route exists.
- [x] AR Scan route exists.
- [x] AR Placement route exists.
- [x] AR Preparation route exists.
- [x] AR Chant route exists.
- [x] AR Merit route exists.
- [x] AR Completion route exists.
- [ ] Replace `Altar3DPlaceholder` with a real `BuddhistAltar3D` component.
- [ ] Add a clearer mode switch between `immersive3D` and `nativeARReady`, with a deliberate config surface and documented swap-in points.
- [ ] Make the fallback scene feel intentionally immersive rather than a styled placeholder.
- [ ] Add camera permission and request handling if the UX continues to describe room scanning.
- [ ] Verify placed altar transform persists correctly across placement, preparation, chant, merit, and completion.
- [ ] Verify reset and confirm placement semantics match the PRD and user expectations.

## Phase 5: 3D Scene, Assets, and Motion

- [ ] Install missing dependencies required by the PRD: `three`, `@react-three/fiber`, `@react-three/drei`, `expo-gl`, `expo-three`, `lottie-react-native`.
- [ ] Decide whether to align the implementation with `expo-av` from the PRD or update the PRD to reflect the current `expo-audio` approach.
- [ ] Create the asset folder structure for:
- [ ] `assets/models/buddha.glb`
- [ ] `assets/models/lotus_pedestal.glb`
- [ ] `assets/models/candle.glb`
- [ ] `assets/models/incense_bowl.glb`
- [ ] `assets/animations/halo.json`
- [ ] `assets/animations/incense_smoke.json`
- [ ] `assets/audio/temple_bell.mp3`
- [ ] `assets/audio/namo_tassa.mp3`
- [ ] Build a composed altar scene with Buddha centered, lotus pedestal below, candles left and right, and incense bowl in front.
- [ ] Add safe loading, loading placeholder UI, and error fallback UI for 3D models.
- [ ] Expose altar props for scale, rotation, `showHalo`, `showIncenseSmoke`, `glowIntensity`, and `animated`.
- [ ] Add halo and incense smoke overlays with reduced-motion-safe behavior.
- [ ] Add subtle verse-change emphasis, such as glow pulse or altar highlight, in AR chant.

## Phase 6: UI and UX Fidelity

- [x] Shared Buddhist theme exists.
- [x] Core reusable Buddhist UI primitives exist.
- [ ] Add a dedicated `ChantOverlay` component if the team wants the AR and non-AR session typography and control layout to stay consistent.
- [ ] Review the Home, Preparation, Session, and Completion screens against the Buddhist design references to close visual polish gaps.
- [ ] Tighten visual parity with existing Buddhist, Islam, and General surfaces across spacing, typography, card treatment, and motion.
- [ ] Ensure the session UI remains calm and uncluttered when all toggles and controls are enabled.
- [ ] Review copy tone for spiritual respect across AR intro, merit dedication, and completion messaging.

## Phase 7: Accessibility and Performance

- [ ] Validate large text scaling on all Buddhist prayer screens.
- [ ] Validate contrast for gold text, secondary text, and translucent cards.
- [ ] Validate screen reader labels and accessibility hints for quick actions, toggle rows, session controls, and AR placement controls.
- [ ] Add reduced-motion-safe defaults and behavior across halo, smoke, and transition effects.
- [ ] Profile session and AR screens on a mid-range Android device.
- [ ] Reduce rerender hot paths in session and AR flows if profiling shows frame drops.
- [ ] Add lazy loading and suspense boundaries for heavy 3D or animated assets.
- [ ] Add graceful handling for missing chant IDs, missing assets, failed model loads, failed audio loads, and aborted sessions.

## Phase 8: Testing and Release Readiness

- [ ] Add Buddhist-specific tests under `__tests__/`.
- [ ] Add tests for chant helpers.
- [ ] Add tests for store actions and state transitions.
- [ ] Add screen-level tests for the standard chant flow.
- [ ] Add screen-level tests for the AR fallback flow.
- [ ] Create a manual QA checklist for standard flow, AR flow, audio, accessibility, and interrupted sessions.
- [ ] Run `npm run lint`.
- [ ] Run targeted test coverage for Buddhist module flows.
- [ ] Confirm all added dependencies remain Expo-compatible before release.
- [ ] Update docs and screenshots once the final 3D and audio assets are integrated.

## Recommended Execution Order

- [ ] Resolve architecture and legacy/new Buddhist flow ownership first.
- [ ] Finish standard prayer flow UX gaps next.
- [ ] Replace the altar placeholder with a real 3D fallback scene.
- [ ] Wire real audio into session and AR chant screens.
- [ ] Close accessibility, performance, and test coverage before release.
