**Engineering PRD: Buddhist Prayer Module (Oremus / Numblock)**

**Overview**

- Scope: Buddhist prayer experience with standard and AR-style flows, optimized for Expo-managed RN with AR-ready abstraction.
- Platforms: iOS/Android.
- Tech: React Native, Expo, TypeScript, Zustand, expo-router, reanimated, lottie, expo-av, three/fiber stack.
- Success: Users can complete standard and AR flows; stable performance on mid-range Android.

---

**Epics and User Stories**

**Epic 1: Core Module Foundations**

- Story 1.1: As a developer, I need a structured feature module with shared types, theme, and utilities so the Buddhist experience is maintainable and extensible.
- Story 1.2: As a developer, I need reusable UI primitives consistent with existing app religious screens to keep visual coherence.

**Acceptance Tests (Epic 1)**

- Given the app loads Buddhist module screens, when navigating between them, then the shared theme and primitives are used consistently (colors, typography, card styles).
- Given the module is imported, when building, then TypeScript compiles without type errors for all shared types and utilities.

---

**Epic 2: Chant Data and Session Logic**

- Story 2.1: As a user, I can browse a seeded list of chants with clear metadata to choose a prayer.
- Story 2.2: As a user, I can progress verse-by-verse through a chant with optional meaning display.
- Story 2.3: As a user, I can pause, resume, replay, and navigate verses during a session.

**Acceptance Tests (Epic 2)**

- Given the chant library, when I open it, then I see at least 4 seeded chants with title, category, duration, and purpose.
- Given a chant session is active, when I press Next, then the verse index increments and the progress updates.
- Given I toggle “show meaning,” when I return to the session, then meaning text appears under the chant text.
- Given I pause the session, when I resume, then the verse index is unchanged and playback state returns to playing.

---

**Epic 3: Standard Prayer Flow**

- Story 3.1: As a user, I can start a standard chant from Home or Library and complete the flow.
- Story 3.2: As a user, I can dedicate merit after chanting and see a completion summary.

**Acceptance Tests (Epic 3)**

- Given I am on Buddhist Home, when I tap “Start Buddhist Prayer,” then I reach Chant Preparation for a default or selected chant.
- Given I complete the chant session, when I continue, then I reach Merit Dedication.
- Given I select a merit option and continue, then I reach Completion with duration and verses completed.

---

**Epic 4: AR-Style Altar Flow**

- Story 4.1: As a user, I can enter an AR-style experience and complete an altar-based chanting session.
- Story 4.2: As a user, I can place, rotate, and scale the altar before starting the chant.
- Story 4.3: As a user, I can chant with overlays while viewing the altar and finish with merit dedication.

**Acceptance Tests (Epic 4)**

- Given I enter the AR flow, when I tap Begin, then I see a scan screen with instructions.
- Given scan simulation completes, when I continue, then I reach placement with 3D altar visible.
- Given I use rotate/scale controls, when I confirm placement, then the altar remains fixed for the rest of the session.
- Given I start AR chanting, when I navigate verses, then the overlay updates without hiding the altar.
- Given I complete AR chanting, when I proceed, then I reach AR Merit and AR Completion.

---

**Epic 5: 3D Altar and Assets**

- Story 5.1: As a user, I see a composed Buddha altar with halo and incense effects where applicable.
- Story 5.2: As a developer, I can load models safely with clear fallback states.

**Acceptance Tests (Epic 5)**

- Given the altar scene loads, when it renders, then Buddha, lotus pedestal, candles, and incense bowl are visible in the correct positions.
- Given a model fails to load, when the scene initializes, then a fallback UI appears without crashing the session.

---

**Epic 6: Audio and Motion**

- Story 6.1: As a user, I can enable monk chanting and temple bell audio.
- Story 6.2: As a user, I see subtle halo/incense animations without excessive motion.

**Acceptance Tests (Epic 6)**

- Given audio is enabled, when I start a session, then chant audio begins and can be toggled off.
- Given temple bell is enabled, when the session starts or completes (as configured), then a bell sound plays.
- Given reduced motion is enabled, when viewing animations, then motion intensity is reduced or disabled.

---

**Epic 7: AR Abstraction and Fallback**

- Story 7.1: As a user, I get a consistent experience even if true AR plane detection is unavailable.
- Story 7.2: As a developer, I can swap in native AR later with minimal refactor.

**Acceptance Tests (Epic 7)**

- Given the device doesn’t support AR, when I start AR flow, then I enter immersive 3D mode with the same screens and controls.
- Given the AR adapter is configured to `nativeARReady`, when the integration is added, then only adapter wiring changes are required, not screen flows.

---

**Epic 8: Performance and Stability**

- Story 8.1: As a user on mid-range Android, the module remains smooth and stable.
- Story 8.2: As a developer, I can lazy-load heavy assets to reduce startup cost.

**Acceptance Tests (Epic 8)**

- Given a mid-range device, when entering the module, then initial screen load is within acceptable UI responsiveness (no blocked UI thread).
- Given I enter AR placement, when models load, then a loading state is shown until ready, and UI remains responsive.

---

**Out of Scope (v1)**

- Full AR plane detection in Expo-managed workflow.
- Cloud sync or full session history persistence.
- Gamification features beyond placeholders.

---

**Acceptance Summary Checklist**

- Standard flow: Home -> Preparation -> Session -> Merit -> Completion works end-to-end.
- AR flow: Intro -> Scan -> Placement -> Preparation -> Chant -> Merit -> Completion works end-to-end in fallback mode.
- At least 4 seeded chants with data helpers.
- Zustand store covers specified session and AR placement states.
- `BuddhistAltar3D` exposes required props and safe loading.
- Performance safeguards and graceful failure states are in place.

If you want, I can add detailed QA test cases (manual + automated), API event instrumentation, or a sprint breakdown aligned to these epics.
