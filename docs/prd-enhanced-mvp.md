# PRD — Prayer Focus Mobile App (Enhanced MVP)

**Platform:** React Native + Expo (iOS / Android)  
**Identity:** Firebase Authentication (email/password; optional anonymous)  
**Data storage:** **Fully local on-device (SQLite)** — no cloud sync for sessions/templates/notes  
**Modes:** Christianity / Islam / Buddhism / **General** (always available)

---

## 1) Product summary

### Problem

People often lose focus while praying due to phone distractions, wandering thoughts, and inconsistent routines. Many focus/meditation apps are not designed for prayer-specific needs, and they often lack respectful tradition-aware support.

### Solution (Enhanced MVP)

A respectful, low-friction app that:

- Creates a **distraction-free prayer session** (timer + minimal UI)
- Provides an optional **pre-prayer preparation ritual** (intention + settling)
- Offers **gentle refocus cues** (haptic/text; sound optional)
- Supports **templates** for repeated routines
- Includes **habit tracking** (calendar dots + simple stats)
- Adds **tradition-aware tools** (Qibla compass, daily verse/chant prompts) while always supporting **General mode**
- Uses **Firebase Auth** for login, while keeping user content **on-device only**

---

## 2) Goals, non-goals

### Goals

- Help users concentrate during prayer with minimal friction.
- Provide respectful personalization across traditions, plus a neutral **General** mode.
- Keep user content private and local: sessions, notes, templates, prayer lists stored on-device.
- Deliver a stable timer experience with clean UX.

### Non-goals (not in Enhanced MVP)

- Cloud sync of sessions/templates/notes.
- Social/community features.
- Wearable support.
- Large content libraries or licensed scripture feeds.
- Advanced behavioral analytics (e.g., unlock detection).

---

## 3) Success metrics

- **Activation:** % users who complete onboarding and start a session within 10 minutes.
- **Retention:** D7 and D30 retention.
- **Core usage:** sessions per user per week; average session duration.
- **Value signal:** average focus rating (1–5) and improvement trend.
- **Templates adoption:** % sessions started from templates.

---

## 4) Target users & personas

1. **Busy believer:** prays daily but gets interrupted; wants quick “focus mode.”
2. **Structured practitioner:** has set prayer routines; wants templates and reminders.
3. **New/returning practitioner:** wants gentle guidance; no pressure or guilt.

---

## 5) Scope

### In scope (Enhanced MVP + base screens)

- Authentication:
  - Email/password sign up + login + forgot password
  - Optional: anonymous sign-in (recommended for frictionless onboarding)
- Onboarding:
  - Choose tradition (Christianity/Islam/Buddhism/**General**) + preferences
  - Quick-try 2-minute session
- Home:
  - Start session
  - Favorites templates
  - “Today prompt” tile (tradition-aware)
  - Shortcut: Qibla tile (Islam)
- Prayer Focus Session:
  - Timer session, minimal UI, distraction-free screen mode
  - “I’m distracted” quick refocus
  - Pause/resume/end
- Guided Preparation:
  - Intention + settle/breath step + optional checklist
- Refocus Prompts:
  - Frequency none/low/medium
  - Cue types: text/haptic (sound optional, off by default)
- Templates:
  - Create/edit/delete, favorites, start session from template
- Habit tracker:
  - Calendar dots
  - Basic stats (sessions/week, minutes/week, avg rating last 7)
- History & reflection:
  - Focus rating + optional note
  - Session list + details
- Profile:
  - User profile + preferences + data notice (“On-device only”)
- Tradition add-ons:
  - Islam: Qibla compass
  - Christianity: daily verse prompt + prayer list
  - Buddhism: randomized chant/mantra prompt
  - General: neutral daily intention prompt

### Out of scope (later)

- Cloud sync / multi-device transfer.
- Group prayer/community.
- Paid subscriptions.
- Watch / wearable companion.
- Rich audio catalog or streaming.

---

## 6) Key principles & UX rules

- **Respect first:** tone should be calm, non-judgmental, and inclusive.
- **General mode always:** never force a religious identity.
- **No streak pressure:** emphasize consistency gently; avoid guilt.
- **Local-only clarity:** clearly communicate that content stays on-device and doesn’t transfer automatically.
- **Minimal session UI:** during prayer, the UI should disappear as much as possible.

---

## 7) User journeys

### Journey A — New user (first 3 minutes)

1. Install → Open → Welcome
2. Sign up / Log in (or Continue as guest)
3. Select tradition (includes **General**)
4. Set preferences (duration, prep, prompts, cues, screen mode)
5. Quick Try session (2 minutes)
6. Rate focus + finish → Home

### Journey B — Returning user (daily)

1. Open Home
2. Tap “Start session” or choose a favorite template
3. Prep step (optional)
4. Session ends → reflection rating → history updated

### Journey C — Template setup

1. Templates → Create new
2. Configure duration, prep, refocus cues, add-ons
3. Save → start from template anytime

---

## 8) Functional requirements

### 8.1 Authentication (Firebase)

**Features**

- Email/password sign up
- Email/password login
- Forgot password
- Logout
- Optional: anonymous sign-in

**Acceptance criteria**

- Users can create an account, log in, reset password, log out.
- Auth state persists across app restarts.
- If anonymous sign-in is enabled, user can access the app without signup and later upgrade to email/password.

---

### 8.2 Onboarding

**Screens**

- Welcome → Tradition → Preferences → Quick Try → Done

**Preferences captured**

- Default session duration
- Prep enabled
- Refocus prompt frequency (none/low/medium)
- Cue type (text/haptic/sound/haptic-only)
- Screen mode (normal/dim/black)
- Neutral language toggle (recommended)

**Acceptance criteria**

- Preferences stored locally and applied to future sessions.
- User can complete onboarding without Quick Try (skip allowed).

---

### 8.3 Home

**Content**

- Primary CTA: Start session
- Favorite templates list
- Today Prompt (verse/chant/intention)
- Qibla shortcut (Islam only)
- Mini progress snippet (calendar dots last 14–30 days)

**Acceptance criteria**

- If no templates exist: show “Create your first template.”
- Home loads fast and remains stable offline.

---

### 8.4 Prayer Focus Session (core)

**Session types**

- Countdown (default)
- (Optional) Count-up

**Session UI**

- Timer display
- Pause/Resume/End
- Optional “Screen dim/black mode”
- “I’m distracted” button → brief refocus prompt

**Acceptance criteria**

- Timer is accurate; session records saved reliably.
- Session completion always leads to Reflection screen.

---

### 8.5 Guided preparation ritual (Enhanced)

**Flow (30–60s)**

- Set intention (preset + custom)
- Settle/breath step
- Optional checklist

**Acceptance criteria**

- Prep is skippable and can be disabled globally or per template.

---

### 8.6 Refocus prompts (Enhanced)

**Prompt types**

- Text overlay (1–2 lines)
- Haptic taps (gentle)
- Sound (optional; off by default)

**Prompt frequency**

- none / low / medium (per preference or template override)

**Acceptance criteria**

- Prompts never feel alarming; no loud default audio.
- If haptics unavailable/disabled, fallback to text or no cue based on user setting.

---

### 8.7 Templates (Enhanced)

**Template fields**

- Name
- Duration
- Prep (inherit or override)
- Refocus frequency (inherit or override)
- Cue type (inherit or override)
- Screen mode (inherit or override)
- Neutral language (inherit or override)
- Add-ons: Qibla shortcut, Daily Prompt toggle
- Favorite & order

**Acceptance criteria**

- CRUD works; favorite templates show on Home.
- Starting from a template launches a session with correct settings.

---

### 8.8 Reflection & history (Enhanced)

**Reflection**

- Focus rating (1–5)
- Optional note
- Optional: “Save as template”

**History**

- List of sessions; tap to detail

**Acceptance criteria**

- Sessions stored locally and visible offline.
- History is accurate even if preferences change later (session stores resolved settings snapshot).

---

### 8.9 Habit tracker (Enhanced)

**Views**

- Calendar dots (30 days)
- Stats:
  - Sessions this week
  - Minutes this week
  - Avg rating last 7

**Acceptance criteria**

- Updates after each completed session.
- Works offline.

---

### 8.10 Profile (Base)

**Fields**

- Display name
- Tradition (can change)
- Preferences summary + edit
- Data section:
  - “On-device only”
  - Optional: Export (JSON)
  - Clear local data

**Acceptance criteria**

- Profile updates reflect across Home and session settings.
- Data notice is visible and understandable.

---

## 9) Tradition add-ons (Enhanced MVP)

### General mode (always available)

- Neutral daily intention prompt
- Neutral refocus prompts by default
- No religious assumptions

### Christianity

- Daily verse prompt (curated list packaged in-app; avoid licensing issues)
- Prayer list:
  - Add/edit/archive items
  - Optional “prayed today” timestamp

### Islam

- Qibla compass:
  - Uses location + device heading
  - Calibration guidance
  - Clear disclaimer about sensor variability

### Buddhism

- Randomized chant/mantra prompt:
  - Curated list packaged in-app
  - Optional favorites

---

## 10) Data storage & privacy

### Storage approach

- **SQLite (expo-sqlite)** is the source of truth for:
  - Preferences, templates, sessions, notes, prayer list, prompt state
- Firebase is used only for **Auth** (identity)
- No Firestore/Realtime DB for user content

### User messaging

- On Welcome and in Profile:
  - “Your sessions and notes are stored on this device only.”

---

## 11) Analytics & telemetry (optional, privacy-respecting)

If implemented later:

- Track only non-sensitive events:
  - onboarding_completed, session_started, session_completed, rating_submitted, template_created, qibla_opened
- Do **not** log notes/intention text.

---

## 12) Tech approach (high level)

- Expo + TypeScript + Expo Router
- Firebase Auth (JS SDK)
- SQLite (expo-sqlite) + migrations (PRAGMA user_version)
- Haptics via expo-haptics
- Sensors/location for Qibla:
  - expo-sensors (for Magnetometer) + expo-location + device heading/compass APIs (implementation detail)

---

## 13) Release plan (milestones)

### Milestone 1 — Foundations

- Navigation stacks + base UI components
- Firebase Auth
- Local DB init + migrations
- Onboarding screens (without Quick Try)

### Milestone 2 — Core sessions

- Session engine + focus screen + reflection
- Local session persistence + history list

### Milestone 3 — Enhanced MVP

- Prep ritual
- Refocus prompts (haptic/text)
- Templates CRUD + favorites
- Habit tracker (calendar + stats)

### Milestone 4 — Tradition add-ons & polish

- Qibla compass
- Daily prompts (General + Christian + Buddhist)
- Christian prayer list
- Accessibility pass + edge cases + QA

---

## 14) Acceptance checklist (Enhanced MVP ship)

- [ ] User can sign up/log in and complete onboarding (including General mode)
- [ ] Local DB stores preferences, templates, sessions, notes reliably
- [ ] Session timer is stable; reflection saves correctly
- [ ] Templates can be created and launched
- [ ] Habit tracker shows correct dots & stats
- [ ] Qibla works with clear permission/calibration UX
- [ ] Daily prompts show and rotate correctly via local catalog
- [ ] Profile shows “On-device only” data messaging

https://stitch.withgoogle.com/projects/4428764679582664497
