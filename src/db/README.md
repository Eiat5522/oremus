# Database Module (`src/db/`)

This module manages the local SQLite database for Oremus using `expo-sqlite`.

## Overview

The database is the **source of truth** for all user-generated content (templates, sessions, prayer lists, preferences). Firebase is used **only for authentication**; all app data is stored locally.

## Files

- **`index.ts`**: Main entry point. Opens the database, enables foreign keys, and runs migrations.
- **`migrate.ts`**: Migration runner. Tracks schema version using `PRAGMA user_version` and applies migrations in order.
- **`sql.ts`**: SQL helper utilities for transactions and batch execution.
- **`migrations/`**: Directory containing numbered migration files.
  - **`001_init.ts`**: Initial schema (creates all tables).

## Usage

### Initialization

Call `initializeDatabase()` once at app startup (typically in `app/_layout.tsx` or via `useAppReady` hook):

```typescript
import { initializeDatabase } from '@/src/db';

// In your app bootstrap
await initializeDatabase();
```

This will:
1. Open the database (`oremus.db`)
2. Enable foreign keys (`PRAGMA foreign_keys = ON`)
3. Run any pending migrations

### Getting the Database Instance

After initialization, get the database instance anywhere in your app:

```typescript
import { getDatabase } from '@/src/db';

const db = getDatabase();
const result = await db.getAllAsync('SELECT * FROM users WHERE id = ?', [userId]);
```

## Migrations

Migrations are stored in `migrations/` and numbered sequentially (001, 002, etc.).

### How Migrations Work

1. The migration runner checks `PRAGMA user_version` to determine the current schema version.
2. It runs all migrations from `currentVersion + 1` to the latest version.
3. Each migration:
   - Contains its own BEGIN/COMMIT transaction for the schema changes
   - Sets `PRAGMA user_version = N` as a separate atomic operation after the migration succeeds
   - If the migration SQL fails, the transaction rolls back automatically
   - If the version update fails, the error propagates and can be retried
4. Migration files must be idempotent (safe to run multiple times) using `IF NOT EXISTS` clauses.

### Adding a New Migration

1. Create a new file: `migrations/00X_description.ts`
2. Export a string constant with your SQL:
   ```typescript
   export const migration002 = `
   BEGIN;
   
   -- Your SQL changes here
   ALTER TABLE users ADD COLUMN new_field TEXT;
   
   COMMIT;
   `;
   ```
3. Register it in `migrate.ts`:
   ```typescript
   const migrations: Record<number, string> = {
     1: migration001,
     2: migration002,  // Add here
   };
   ```

### Testing Migrations Locally

Use the `scripts/run-migrations.js` script to test migrations:

```bash
npm run db:migrate
```

Or run it directly:

```bash
node scripts/run-migrations.js
```

## Schema

The full schema is documented in `docs/db-schema.md`.

### Key Tables

- **`users`**: Maps to Firebase Auth users
- **`preferences`**: User settings (1 row per user)
- **`templates`**: Saved session templates
- **`sessions`**: Completed meditation/prayer sessions (append-only)
- **`prayer_list_items`**: Christian prayer list
- **`daily_prompt_state`**: Tracks daily prompt rotation
- **`favorite_prompts`**: User-favorited prompts

### Foreign Keys

Foreign keys are **enabled** and enforce referential integrity:
- `ON DELETE CASCADE`: Child rows are deleted when parent is deleted
- `ON DELETE SET NULL`: Child rows have the FK set to NULL when parent is deleted

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection:
   ```typescript
   // Good
   db.getAllAsync('SELECT * FROM users WHERE id = ?', [userId]);
   
   // Bad (vulnerable)
   db.getAllAsync(`SELECT * FROM users WHERE id = '${userId}'`);
   ```

2. **Use transactions for multiple writes**:
   ```typescript
   await db.withTransactionAsync(async () => {
     await db.runAsync('INSERT INTO ...');
     await db.runAsync('UPDATE ...');
   });
   ```

3. **Handle errors gracefully**:
   ```typescript
   try {
     await db.runAsync('INSERT INTO ...');
   } catch (error) {
     console.error('DB error:', error);
     // Handle error appropriately
   }
   ```

4. **Keep migrations atomic**: Each migration should be a single logical change that can be rolled back if it fails.

## Debugging

Enable verbose logging by checking migration logs:
- Look for `[DB]` and `[DB Migration]` console logs
- Check for transaction rollbacks or migration failures

### Common Issues

1. **"Database not initialized"**: Make sure `initializeDatabase()` is called before `getDatabase()`.
2. **Foreign key constraint failed**: Ensure parent rows exist before inserting child rows.
3. **Migration fails**: Check the migration SQL for syntax errors. The transaction will rollback automatically.

## Future Enhancements

- Add database backup/restore functionality
- Implement data export (CSV, JSON)
- Add query performance monitoring
- Consider indexing strategy as data grows
