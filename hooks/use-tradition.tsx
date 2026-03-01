import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { updateFocusGateSettings } from '@/lib/focus-gate';

const TRADITION_STORAGE_KEY = '@oremus/tradition';

interface TraditionContextType {
  tradition: Tradition | null;
  isLoading: boolean;
  setTradition: (tradition: Tradition) => Promise<void>;
  traditionDetails: (typeof TRADITION_OPTIONS)[number] | undefined;
}

const TraditionContext = createContext<TraditionContextType | undefined>(undefined);

export function TraditionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [tradition, setTraditionState] = useState<Tradition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTradition = async () => {
      try {
        const storedTradition = await AsyncStorage.getItem(TRADITION_STORAGE_KEY);
        if (storedTradition) {
          const isValid = TRADITION_OPTIONS.some((t) => t.id === storedTradition);
          if (isValid) {
            const parsedTradition = storedTradition as Tradition;
            setTraditionState(parsedTradition);
            updateFocusGateSettings((previous) => ({
              ...previous,
              tradition: parsedTradition,
            })).catch((err) => console.error('Failed to sync focus-gate settings:', err));
          }
        }
      } catch (error) {
        console.error('Failed to load tradition preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTradition();
  }, []);

  const setTradition = useCallback(
    async (newTradition: Tradition) => {
      const previousTradition = tradition;
      try {
        await AsyncStorage.setItem(TRADITION_STORAGE_KEY, newTradition);
        setTraditionState(newTradition);
        await updateFocusGateSettings((previous) => ({ ...previous, tradition: newTradition }));
      } catch (error) {
        console.error('Failed to save tradition preference:', error);
        // Attempt rollback
        if (previousTradition !== null) {
          await AsyncStorage.setItem(TRADITION_STORAGE_KEY, previousTradition).catch(() => {});
        }
        setTraditionState(previousTradition);
        throw error;
      }
    },
    [tradition],
  );

  const traditionDetails = useMemo(
    () => TRADITION_OPTIONS.find((t) => t.id === tradition),
    [tradition],
  );
  const value = useMemo(
    () => ({
      tradition,
      isLoading,
      setTradition,
      traditionDetails,
    }),
    [tradition, isLoading, setTradition, traditionDetails],
  );

  return <TraditionContext.Provider value={value}>{children}</TraditionContext.Provider>;
}

export function useTradition() {
  const context = useContext(TraditionContext);
  if (context === undefined) {
    throw new Error('useTradition must be used within a TraditionProvider');
  }
  return context;
}
