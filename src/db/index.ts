/**
 * Database Initialization
 * 
 * Opens the SQLite database, enables foreign keys, and runs migrations.
 * This is the main entry point for database operations.
 */

import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrate';

const DB_NAME = 'oremus.db';

let dbInstance: SQLiteDatabase | null = null;

/**
 * Initialize the database
 * Opens the database, enables foreign keys, and runs migrations
 * @returns Promise that resolves to the database instance
 */
export async function initializeDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  console.log('[DB] Opening database:', DB_NAME);
  
  // Open database
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable foreign keys (MUST be done after opening)
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  console.log('[DB] Foreign keys enabled');

  // Run migrations
  await runMigrations(dbInstance);

  console.log('[DB] Database initialized successfully');
  
  return dbInstance;
}

/**
 * Get the database instance
 * Throws an error if the database has not been initialized
 * @returns The database instance
 */
export function getDatabase(): SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Close the database connection
 * Useful for cleanup or testing
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('[DB] Database closed');
  }
}
