import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const USER_STORAGE_KEY = '@oremus/user';

interface UserData {
  name: string;
  profileImage?: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  setUser: (user: UserData) => Promise<void>;
  setProfileImage: (imageUri: string) => Promise<void>;
  userName: string;
  userProfileImage?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const setUser = useCallback(async (newUser: UserData) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUserState(newUser);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }, []);

  const userName = useMemo(() => user?.name || 'Guest', [user]);

  const setProfileImage = useCallback(
    async (imageUri: string) => {
      const currentUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const parsed = currentUser ? JSON.parse(currentUser) : { name: 'Guest' };
      const newUser = { ...parsed, profileImage: imageUri };
      await setUser(newUser);
    },
    [setUser],
  );

  const userProfileImage = useMemo(() => user?.profileImage, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      setUser,
      setProfileImage,
      userName,
      userProfileImage,
    }),
    [user, isLoading, setUser, setProfileImage, userName, userProfileImage],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
