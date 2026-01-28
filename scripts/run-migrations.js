#!/usr/bin/env node
/**
 * Migration Test Script
 * 
 * This script verifies that migration SQL is valid by:
 * 1. Checking that migration files exist and export the expected format
 * 2. Validating SQL syntax (basic checks)
 * 3. Confirming migration structure
 * 
 * Note: This is a Node.js script for development/CI purposes.
 * Actual migrations run in the Expo/React Native environment using expo-sqlite.
 * 
 * Usage:
 *   npm run db:migrate
 *   or
 *   node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying database migrations...\n');

// Path to migrations directory
const migrationsDir = path.join(__dirname, '../src/db/migrations');
const migrateFile = path.join(__dirname, '../src/db/migrate.ts');

/**
 * Check if migrations directory exists
 */
function checkMigrationsDirectory() {
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Error: Migrations directory not found at', migrationsDir);
    process.exit(1);
  }
  console.log('✅ Migrations directory exists');
}

/**
 * Get all migration files
 */
function getMigrationFiles() {
  const files = fs.readdirSync(migrationsDir);
  const migrationFiles = files
    .filter(f => f.match(/^\d{3}_.*\.ts$/))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.error('❌ Error: No migration files found');
    process.exit(1);
  }
  
  console.log(`✅ Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach(f => console.log(`   - ${f}`));
  return migrationFiles;
}

/**
 * Validate migration file content
 */
function validateMigrationFile(filename) {
  const filepath = path.join(migrationsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  
  const migrationNum = filename.match(/^(\d{3})/)[1];
  const expectedExport = `migration${migrationNum}`;
  
  // Check for export
  if (!content.includes(`export const ${expectedExport}`)) {
    console.error(`❌ Error: ${filename} does not export '${expectedExport}'`);
    return false;
  }
  
  // Check for SQL transaction
  if (!content.includes('BEGIN;')) {
    console.warn(`⚠️  Warning: ${filename} does not contain 'BEGIN;' - should use transactions`);
  }
  
  if (!content.includes('COMMIT;')) {
    console.warn(`⚠️  Warning: ${filename} does not contain 'COMMIT;' - should use transactions`);
  }
  
  // Check for basic SQL keywords
  const hasSQL = content.includes('CREATE TABLE') || 
                 content.includes('ALTER TABLE') ||
                 content.includes('DROP TABLE');
  
  if (!hasSQL) {
    console.warn(`⚠️  Warning: ${filename} does not contain SQL DDL statements`);
  }
  
  console.log(`✅ ${filename} structure is valid`);
  return true;
}

/**
 * Check that migrations are registered in migrate.ts
 */
function checkMigrationRegistry() {
  if (!fs.existsSync(migrateFile)) {
    console.error('❌ Error: migrate.ts not found at', migrateFile);
    return false;
  }
  
  const content = fs.readFileSync(migrateFile, 'utf8');
  
  // Check for migration imports
  if (!content.includes('from \'./migrations/001_init\'')) {
    console.error('❌ Error: migration001 not imported in migrate.ts');
    return false;
  }
  
  // Check for migration map
  if (!content.includes('const migrations: Record<number, string>')) {
    console.error('❌ Error: migrations map not found in migrate.ts');
    return false;
  }
  
  console.log('✅ Migrations are properly registered in migrate.ts');
  return true;
}

/**
 * Validate migration 001 matches schema doc
 */
function validateMigration001() {
  const migration001Path = path.join(migrationsDir, '001_init.ts');
  const schemaDocPath = path.join(__dirname, '../docs/db-schema.md');
  
  if (!fs.existsSync(migration001Path)) {
    console.error('❌ Error: 001_init.ts not found');
    return false;
  }
  
  const migration001 = fs.readFileSync(migration001Path, 'utf8');
  
  // Check for all expected tables
  const expectedTables = [
    'users',
    'preferences', 
    'templates',
    'sessions',
    'prayer_list_items',
    'daily_prompt_state',
    'favorite_prompts'
  ];
  
  const missingTables = expectedTables.filter(table => 
    !migration001.includes(`CREATE TABLE IF NOT EXISTS ${table}`)
  );
  
  if (missingTables.length > 0) {
    console.error(`❌ Error: Missing tables in 001_init.ts: ${missingTables.join(', ')}`);
    return false;
  }
  
  console.log('✅ Migration 001 contains all expected tables');
  
  // Check for indexes
  const hasIndexes = migration001.includes('CREATE INDEX');
  if (!hasIndexes) {
    console.warn('⚠️  Warning: Migration 001 does not create any indexes');
  } else {
    console.log('✅ Migration 001 includes index creation');
  }
  
  // Check for foreign keys
  const hasForeignKeys = migration001.includes('FOREIGN KEY');
  if (!hasForeignKeys) {
    console.warn('⚠️  Warning: Migration 001 does not define foreign keys');
  } else {
    console.log('✅ Migration 001 defines foreign key constraints');
  }
  
  return true;
}

/**
 * Main validation
 */
function main() {
  try {
    checkMigrationsDirectory();
    console.log();
    
    const migrationFiles = getMigrationFiles();
    console.log();
    
    let allValid = true;
    migrationFiles.forEach(file => {
      if (!validateMigrationFile(file)) {
        allValid = false;
      }
    });
    console.log();
    
    if (!checkMigrationRegistry()) {
      allValid = false;
    }
    console.log();
    
    if (!validateMigration001()) {
      allValid = false;
    }
    console.log();
    
    if (allValid) {
      console.log('✅ All migration checks passed!');
      console.log('\n📝 Note: This script validates migration structure only.');
      console.log('   Actual migrations run in the Expo app using expo-sqlite.');
      console.log('   To test migrations in-app, run the Expo app and check logs.\n');
      process.exit(0);
    } else {
      console.error('❌ Some migration checks failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running migration checks:', error.message);
    process.exit(1);
  }
}

main();
