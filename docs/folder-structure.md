# Folder Structure (React Native + Expo + Expo Router)

A practical structure that keeps **routing in `app/`** and app logic in `src/`. It supports:
- Firebase Auth (identity)
- Local SQLite (source of truth)
- Tradition add-ons (Qibla, daily prompts)
- Session flow as a modal stack

---

## Top-level layout

```
.
├─ app/                          # expo-router routes (screens)
├─ src/                          # non-route app code (domain logic)
├─ assets/                       # icons, fonts, images, audio
├─ docs/                         # PRD, schema docs, internal notes (optional)
├─ scripts/                      # one-off scripts (optional)
├─ app.config.ts                 # Expo config (or app.json)
├─ package.json
├─ tsconfig.json
└─ ...
```

---

## `app/` (Routes)

```
app
├─ _layout.tsx                   # Root layout (providers, theme, auth gate)
├─ (auth)/
│  ├─ _layout.tsx                # Auth stack layout
│  ├─ welcome.tsx
│  ├─ login.tsx
│  ├─ signup.tsx
│  └─ forgot-password.tsx
│
├─ (onboarding)/
│  ├─ _layout.tsx
│  ├─ start.tsx
│  ├─ tradition.tsx              # includes "General"
│  ├─ preferences.tsx
│  ├─ quick-try.tsx
│  └─ done.tsx
│
├─ (tabs)/
│  ├─ _layout.tsx                # Bottom tabs
│  ├─ home.tsx
│  ├─ templates.tsx
│  ├─ history.tsx
│  └─ profile.tsx
│
├─ session/
│  ├─ _layout.tsx                # Modal stack for session flow
│  ├─ prep.tsx
│  ├─ focus.tsx
│  └─ reflection.tsx
│
├─ templates/
│  ├─ new.tsx
│  ├─ [id]/
│  │  ├─ edit.tsx
│  │  └─ details.tsx             # optional
│  └─ _layout.tsx                # optional if you want nested stack behavior
│
├─ history/
│  ├─ [id].tsx
│  └─ _layout.tsx                # optional
│
└─ addons/
   ├─ qibla.tsx
   └─ daily-prompt.tsx
```

**Guideline:** route files should stay “thin” and call hooks/services from `src/`.

---

## `src/` (App code)

```
src
├─ components/
│  ├─ ui/                        # Buttons, Cards, Inputs, etc.
│  ├─ session/                   # Session UI pieces (Timer, PromptOverlay)
│  ├─ templates/                 # Template cards, forms
│  └─ profile/                   # Profile blocks
│
├─ features/                     # Domain modules by feature
│  ├─ auth/
│  │  ├─ firebase.ts             # Firebase init + helpers
│  │  ├─ useAuth.ts              # auth state hook
│  │  └─ authService.ts          # login/signup/logout/reset
│  │
│  ├─ onboarding/
│  │  ├─ onboardingService.ts    # mark complete, set defaults
│  │  └─ onboardingStore.ts       # local UI state
│  │
│  ├─ preferences/
│  │  ├─ preferencesRepo.ts       # SQLite CRUD
│  │  ├─ preferencesService.ts    # merge logic + defaults
│  │  └─ preferencesTypes.ts
│  │
│  ├─ templates/
│  │  ├─ templatesRepo.ts
│  │  ├─ templatesService.ts
│  │  ├─ templateFormSchema.ts    # validation (zod or custom)
│  │  └─ templatesTypes.ts
│  │
│  ├─ sessions/
│  │  ├─ sessionEngine.ts         # timer lifecycle + prompt scheduling
│  │  ├─ sessionsRepo.ts
│  │  ├─ sessionsService.ts       # start/end/save session
│  │  ├─ sessionTypes.ts
│  │  └─ useSessionController.ts  # hook used by /session screens
│  │
│  ├─ history/
│  │  ├─ historyService.ts        # stats queries, calendar dots
│  │  └─ historyTypes.ts
│  │
│  ├─ addons/
│  │  ├─ qibla/
│  │  │  ├─ qiblaService.ts       # heading math + calibration hints
│  │  │  └─ useQibla.ts
│  │  └─ dailyPrompt/
│  │     ├─ promptCatalog.ts      # local prompt lists (keys + text)
│  │     ├─ promptService.ts      # pick daily prompt + favorites
│  │     ├─ promptsRepo.ts        # daily_prompt_state + favorites
│  │     └─ promptTypes.ts
│  │
│  └─ prayerList/                 # Christianity
│     ├─ prayerListRepo.ts
│     ├─ prayerListService.ts
│     └─ prayerListTypes.ts
│
├─ db/
│  ├─ index.ts                    # open DB, enable foreign keys
│  ├─ migrations/
│  │  ├─ 001_init.ts              # contains the SQL from schema doc
│  │  └─ migrate.ts               # runs migrations based on user_version
│  └─ sql.ts                      # helper to execute batches/transactions
│
├─ state/
│  ├─ appStore.ts                 # global store (zustand) if you use it
│  └─ selectors.ts
│
├─ hooks/
│  ├─ useAppReady.ts              # load fonts, migrate DB, auth bootstrap
│  ├─ useHaptics.ts
│  └─ usePermissions.ts
│
├─ constants/
│  ├─ traditions.ts               # enums + labels
│  ├─ durations.ts
│  └─ copy.ts                     # neutral + tradition prompt copy banks
│
├─ utils/
│  ├─ time.ts                     # ms/sec helpers, date formatting
│  ├─ uuid.ts
│  ├─ guards.ts                   # runtime checks
│  └─ logger.ts
│
└─ types/
   └─ global.d.ts
```

---

## Content strategy for “daily prompts”
Store the **actual text** (verses/chants/intentions) in code under:

- `src/features/addons/dailyPrompt/promptCatalog.ts`

Only store **keys** in SQLite (`daily_prompt_state.prompt_key`, `favorite_prompts.prompt_key`).

---

## Suggested provider setup (`app/_layout.tsx`)
- Initialize Firebase
- Open SQLite DB + run migrations
- Start auth listener
- If user is authed:
  - ensure local `users` row exists
  - ensure `preferences` row exists (defaults)
- Route user:
  - if onboarding not complete → `(onboarding)`
  - else → `(tabs)`

(You can track onboarding completion in SQLite with a `preferences` field or a tiny `user_flags` table if you prefer.)

