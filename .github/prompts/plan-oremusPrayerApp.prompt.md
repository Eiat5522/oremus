## Plan: Implement Oremus Prayer Focus App MVP

Build a cross-platform Expo prayer/meditation app with local-first SQLite storage, Firebase Auth, and tradition-aware features (Christianity, Islam, Buddhism, General). The project is currently at the Expo starter template stage — all core functionality needs implementation following the PRD, database schema, and folder structure in [docs/](docs/).

### Steps

1. **Set up project architecture** — Restructure to match recommended [folder-structure.md](docs/folder-structure.md): create `src/` directory with `features/`, `db/`, `state/`, `hooks/`, `constants/`, `utils/`, and `types/` subdirectories; move existing components appropriately.

2. **Implement database layer** — Add `expo-sqlite`, create [db/](docs/db-schema.md) module with schema migrations for all 7 tables (`users`, `preferences`, `templates`, `sessions`, `prayer_list_items`, `daily_prompt_state`, `favorite_prompts`), and build repository/service patterns.

3. **Add Firebase Auth integration** — Configure Firebase JS SDK, create `src/features/auth/` with login, signup, forgot-password screens in [app/(auth)/](app/), and wire auth state to Zustand store.

4. **Build onboarding flow** — Implement [app/(onboarding)/](app/) routes: welcome → tradition selection → preferences → quick-try (2 min session) → done, using UI from [select_your_tradition/code.html](docs/screens/select_your_tradition/code.html).

5. **Create core session experience** — Build session modal stack in [app/session/](app/): preparation ritual (intention + breathing), focus timer with refocus prompts, and post-session reflection, referencing [active_prayer_session/code.html](docs/screens/active_prayer_session/code.html) and [set_intention/code.html](docs/screens/set_intention/code.html).

6. **Implement home, templates, history, and profile tabs** — Redesign [app/(tabs)/](app/(tabs)/) with 4 tabs matching [prayer_focus_home/code.html](docs/screens/prayer_focus_home/code.html): session CTA, favorites, habit dots, today prompt; add templates CRUD, history list, and profile settings screens.

### Further Considerations

1. **Phasing strategy?** Implement in 4 milestones (Foundations → Core Sessions → Enhanced MVP → Addons) per PRD, or prioritize a different order?

2. **Design tokens extraction?** Extract color palette, typography, and spacing from the HTML mockups into [constants/theme.ts](constants/theme.ts) before building components?

3. **Tradition addons scope?** Include Qibla compass, daily prompts, and Christian prayer list in MVP, or defer to a later release?
