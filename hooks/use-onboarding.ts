import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

interface OnboardingState {
  /** Whether onboarding has been completed (persisted in AsyncStorage). */
  isOnboardingCompleted: boolean;
  /** True while loading the persisted value from storage. */
  isLoading: boolean;
  /** Mark onboarding as completed and persist the flag. */
  completeOnboarding: () => Promise<void>;
  /** Reset onboarding state (for testing / re-onboarding). */
  resetOnboarding: () => Promise<void>;
}

export function useOnboarding(): OnboardingState {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setIsOnboardingCompleted(value === 'true');
      } catch {
        // Treat errors as "not completed" — user sees onboarding again
        setIsOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOnboardingCompleted(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsOnboardingCompleted(false);
  }, []);

  return { isOnboardingCompleted, isLoading, completeOnboarding, resetOnboarding };
}
