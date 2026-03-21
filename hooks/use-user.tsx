import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const USER_STORAGE_KEY = '@oremus/user';
const DEFAULT_USER_NAME = 'Guest';

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

function normalizeUserData(value: unknown): UserData | null {
  if (typeof value === 'string') {
    const trimmedName = value.trim();
    return trimmedName ? { name: trimmedName } : null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<UserData>;
  if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) {
    return null;
  }

  const normalizedUser: UserData = {
    name: candidate.name.trim(),
  };

  if (typeof candidate.profileImage === 'string' && candidate.profileImage.trim().length > 0) {
    normalizedUser.profileImage = candidate.profileImage;
  }

  return normalizedUser;
}

function parseStoredUser(rawUser: string | null): UserData | null {
  if (!rawUser) {
    return null;
  }

  try {
    return normalizeUserData(JSON.parse(rawUser));
  } catch {
    return normalizeUserData(rawUser);
  }
}

export function UserProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        setUserState(parseStoredUser(storedUser));
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
      const normalizedUser = normalizeUserData(newUser);
      if (!normalizedUser) {
        throw new Error('User name is required.');
      }

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      setUserState(normalizedUser);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }, []);

  const userName = useMemo(() => user?.name || DEFAULT_USER_NAME, [user]);

  const setProfileImage = useCallback(
    async (imageUri: string) => {
      const currentUser = user ?? parseStoredUser(await AsyncStorage.getItem(USER_STORAGE_KEY));
      const newUser = {
        ...(currentUser ?? { name: DEFAULT_USER_NAME }),
        profileImage: imageUri,
      };
      await setUser(newUser);
    },
    [setUser, user],
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
