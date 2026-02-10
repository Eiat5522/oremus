import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TRADITION_STORAGE_KEY = '@oremus/tradition';

interface TraditionContextType {
  tradition: Tradition | null;
  isLoading: boolean;
  setTradition: (tradition: Tradition) => Promise<void>;
  traditionDetails: (typeof TRADITION_OPTIONS)[0] | undefined;
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
           setTraditionState(storedTradition as Tradition);
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

  const setTradition = useCallback(async (newTradition: Tradition) => {
    try {
      await AsyncStorage.setItem(TRADITION_STORAGE_KEY, newTradition);
      setTraditionState(newTradition);
    } catch (error) {
      console.error('Failed to save tradition preference:', error);
      throw error;
    }
  }, []);

 const traditionDetails = useMemo(
   () => TRADITION_OPTIONS.find((t) => t.id === tradition),
   [tradition]
 );
 const value = useMemo(
   () => ({
     tradition,
     isLoading,
     setTradition,
     traditionDetails,
   }),
   [tradition, isLoading, setTradition, traditionDetails]
 );

  return (
    <TraditionContext.Provider value={value}>
      {children}
    </TraditionContext.Provider>
  );
}

export function useTradition() {
  const context = useContext(TraditionContext);
  if (context === undefined) {
    throw new Error('useTradition must be used within a TraditionProvider');
  }
  return context;
}
