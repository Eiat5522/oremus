# Source Directory (`src/`)

This directory contains all non-route application code for Oremus. The `app/` directory handles routing via Expo Router, while `src/` contains the domain logic, components, and utilities.

## Directory Structure

### `components/`
Reusable UI components organized by feature area:
- **`ui/`**: Generic UI primitives (buttons, cards, inputs, etc.)
- **`session/`**: Session-specific UI (timer, prompt overlay, etc.)
- **`templates/`**: Template management UI (cards, forms)
- **`profile/`**: User profile components

### `features/`
Domain logic organized by feature:
- **`auth/`**: Firebase authentication (identity only)
- **`onboarding/`**: First-time user experience
- **`preferences/`**: User settings management
- **`templates/`**: Template CRUD operations
- **`sessions/`**: Session lifecycle and timer logic
- **`history/`**: Session history and stats
- **`addons/`**: Add-on features (Qibla, daily prompts, prayer lists)

### `db/`
Local SQLite database layer:
- Database initialization
- Migration system
- SQL helpers
- See `db/README.md` for detailed documentation

### `state/`
Global state management (if using Zustand or similar):
- App-wide state store
- Selectors and actions

### `hooks/`
Custom React hooks:
- `useAppReady`: App initialization
- `useHaptics`: Haptic feedback
- `usePermissions`: Device permissions
- Other reusable hooks

### `constants/`
App-wide constants:
- Tradition definitions
- Duration presets
- Copy/text content

### `utils/`
Helper utilities:
- Time/date formatting
- UUID generation
- Type guards
- Logging

### `types/`
TypeScript type definitions:
- Global types
- Shared interfaces

## Architecture Principles

1. **Routes are thin**: Route files in `app/` should be minimal and delegate to hooks/services in `src/`.

2. **Local-first**: SQLite is the source of truth. Firebase is for auth only.

3. **Feature organization**: Group related code by feature, not by type.

4. **Type safety**: Leverage TypeScript for better DX and fewer bugs.

5. **Path aliases**: Use `@/src/...` imports (configured in `tsconfig.json`).

## Getting Started

### Importing from src

Use the `@/` path alias:

```typescript
import { initializeDatabase } from '@/src/db';
import { useAppReady } from '@/src/hooks/useAppReady';
import { ThemedButton } from '@/src/components/ui/ThemedButton';
```

### Adding New Features

1. Create a feature directory under `src/features/`
2. Add domain logic (repositories, services, types)
3. Create UI components in `src/components/`
4. Export from feature index if needed
5. Use in route files via hooks/services

### Database Operations

See `src/db/README.md` for database usage and migrations.

## Best Practices

- Keep components small and focused
- Extract business logic into services
- Use TypeScript for all new code
- Write tests for critical logic
- Document complex algorithms
- Follow existing code patterns

## Development Workflow

1. **Database changes**: Add migrations in `src/db/migrations/`
2. **New features**: Create in `src/features/` with types, repo, service
3. **UI components**: Add to appropriate `src/components/` subdirectory
4. **Routes**: Keep route files thin, use hooks from `src/`

## Future Enhancements

- Add comprehensive unit tests
- Implement E2E testing
- Add performance monitoring
- Improve error handling
- Enhance TypeScript coverage
