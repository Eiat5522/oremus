/**
 * Main entry point for src/ exports
 * 
 * Re-export commonly used utilities and types.
 * For specific features, import directly from feature modules.
 */

// Database
export { initializeDatabase, getDatabase, closeDatabase } from './db';

// Hooks
export { useAppReady } from './hooks/useAppReady';

// Types
// TODO: Export shared types here as they're defined

// TODO: Add feature module exports as features are implemented:
// export * from './features/auth';
// export * from './features/templates';
// export * from './features/sessions';

