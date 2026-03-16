import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export function useChristianExitGuard(route: string) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.push({
          pathname: '/christian/exit-confirm',
          params: {
            returnTo: route,
          },
        });
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [route, router]),
  );
}
