/**
 * useAppReady Hook
 * 
 * This hook handles app initialization:
 * - Load fonts
 * - Initialize database (run migrations)
 * - Bootstrap Firebase auth
 * - Ensure SplashScreen stays visible until ready
 * 
 * Usage in app/_layout.tsx:
 * 
 * ```typescript
 * const appIsReady = useAppReady();
 * 
 * if (!appIsReady) {
 *   return null;
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { initializeDatabase } from '@/src/db';
// import { initializeFirebase } from '@/src/features/auth/firebase';

// Keep splash screen visible while app is loading
SplashScreen.preventAutoHideAsync();

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] Initializing app...');

        // TODO: Load fonts
        // await Font.loadAsync({ ... });

        // Initialize database and run migrations
        await initializeDatabase();

        // TODO: Initialize Firebase
        // await initializeFirebase();

        console.log('[App] App initialization complete');
      } catch (error) {
        console.error('[App] Initialization error:', error);
        // In production, you might want to show an error screen
        // For now, we'll still mark as ready to prevent app from hanging
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Hide splash screen once app is ready
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return isReady;
}
