import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

type UseDeferredNativeMountOptions = {
  delayMs?: number;
  enabled?: boolean;
};

const DEFAULT_DELAY_MS = 150;

export function useDeferredNativeMount(
  options: UseDeferredNativeMountOptions = {}
) {
  const { delayMs = DEFAULT_DELAY_MS, enabled = true } = options;
  const [isReady, setIsReady] = useState(Platform.OS === 'web' || !enabled);

  useEffect(() => {
    const shouldMountImmediately = Platform.OS === 'web' || !enabled;

    setIsReady(shouldMountImmediately);

    if (shouldMountImmediately) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsReady(true);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [delayMs, enabled]);

  return isReady;
}
