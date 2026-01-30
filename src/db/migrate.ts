/**
 * Migration Runner
 * 
 * Manages database schema migrations using PRAGMA user_version.
 * Migrations are run sequentially in order.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { runInTransaction } from './sql';
import { migration001 } from './migrations/001_init';

// Map of migration version to migration SQL
const migrations: Record<number, string> = {
  1: migration001,
};

/**
 * Get current database schema version
 * @param db - The SQLite database instance
 * @returns The current user_version (schema version)
 */
async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  return result?.user_version ?? 0;
}

/**
 * Set database schema version
 * @param db - The SQLite database instance
 * @param version - The version to set (must be a positive integer)
 */
async function setVersion(db: SQLiteDatabase, version: number): Promise<void> {
  // Validate version is a positive integer
  if (!Number.isInteger(version) || version < 0) {
    throw new Error(`Invalid version number: ${version}`);
  }
  await db.execAsync(`PRAGMA user_version = ${version};`);
}

/**
 * Run all pending migrations
 * @param db - The SQLite database instance
 * @returns Promise that resolves when all migrations are complete
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);
  
  // Handle empty migrations object
  const migrationVersions = Object.keys(migrations).map(Number);
  if (migrationVersions.length === 0) {
    console.log('[DB Migration] No migrations defined');
    return;
  }
  
  const targetVersion = Math.max(...migrationVersions);

  console.log(`[DB Migration] Current version: ${currentVersion}, Target version: ${targetVersion}`);

  if (currentVersion >= targetVersion) {
    console.log('[DB Migration] Database is up to date');
    return;
  }

  // Run migrations in order
  for (let version = currentVersion + 1; version <= targetVersion; version++) {
    const migration = migrations[version];
    if (!migration) {
      throw new Error(`Missing migration for version ${version}`);
    }

    console.log(`[DB Migration] Running migration ${version}...`);
    
    try {
      // Execute the migration SQL (which includes BEGIN/COMMIT)
      await runInTransaction(db, migration);
      
      // Set the new version (atomic operation after successful migration)
      await setVersion(db, version);
      
      console.log(`[DB Migration] Migration ${version} completed successfully`);
    } catch (error) {
      console.error(`[DB Migration] Migration ${version} failed:`, error);
      throw new Error(`Migration ${version} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('[DB Migration] All migrations completed successfully');
}
