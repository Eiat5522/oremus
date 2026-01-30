/**
 * SQL Helper for batch execution and transactions
 * 
 * Provides utilities to run multiple SQL statements in a single transaction
 * and execute SQL batches safely.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Execute multiple SQL statements in a single transaction
 * @param db - The SQLite database instance
 * @param statements - Array of SQL statements to execute
 * @returns Promise that resolves when all statements are executed
 */
export async function executeTransaction(
  db: SQLiteDatabase,
  statements: string[]
): Promise<void> {
  await db.execAsync('BEGIN;');
  try {
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execAsync(statement);
      }
    }
    await db.execAsync('COMMIT;');
  } catch (error) {
    try {
      await db.execAsync('ROLLBACK;');
    } catch (rollbackError) {
      console.error('[SQL] Rollback failed:', rollbackError);
    }
    throw error;
  }
}

/**
 * Execute a single SQL statement
 * @param db - The SQLite database instance
 * @param sql - SQL statement to execute
 * @returns Promise that resolves when the statement is executed
 */
export async function executeSql(
  db: SQLiteDatabase,
  sql: string
): Promise<void> {
  await db.execAsync(sql);
}

/**
 * Execute SQL batch (convenience wrapper)
 * 
 * Note: This function executes SQL as-is without wrapping in a transaction.
 * If your SQL needs transaction handling, it should include BEGIN/COMMIT
 * statements, or use executeTransaction() instead.
 * 
 * @param db - The SQLite database instance
 * @param sql - SQL string (can contain multiple statements)
 * @returns Promise that resolves when execution is complete
 */
export async function executeSqlBatch(
  db: SQLiteDatabase,
  sql: string
): Promise<void> {
  await db.execAsync(sql);
}

/**
 * Execute migration SQL that includes its own transaction
 * 
 * This is specifically for migration files that contain BEGIN/COMMIT.
 * Use executeSqlBatch() for the same functionality with a clearer name.
 * 
 * @param db - The SQLite database instance
 * @param sql - SQL string with BEGIN/COMMIT
 * @returns Promise that resolves when transaction is complete
 * @deprecated Use executeSqlBatch() instead for clarity
 */
export async function runInTransaction(
  db: SQLiteDatabase,
  sql: string
): Promise<void> {
  await executeSqlBatch(db, sql);
}
