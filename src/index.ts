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
// Export shared types here as they're defined
