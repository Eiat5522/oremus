import { useEffect, useState } from 'react';

import {
  getCachedChristianPrayerCornerModelSnapshot,
  loadChristianPrayerCornerModels,
  type ChristianPrayerCornerModelSnapshot,
} from '@/features/christian-prayer/services/christianModels.service';

export type ChristianPrayerCornerModelLoadState = ChristianPrayerCornerModelSnapshot;

export function useChristianPrayerCornerModels(): ChristianPrayerCornerModelLoadState {
  const [state, setState] = useState<ChristianPrayerCornerModelLoadState>(() =>
    getCachedChristianPrayerCornerModelSnapshot(),
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const snapshot = await loadChristianPrayerCornerModels();
      if (isMounted) {
        setState(snapshot);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
