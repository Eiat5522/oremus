import { useEffect } from 'react';

import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

export function useChristianRouteSync(route: string) {
  const setCurrentRoute = useChristianSessionStore((state) => state.setCurrentRoute);

  useEffect(() => {
    setCurrentRoute(route);
  }, [route, setCurrentRoute]);
}
