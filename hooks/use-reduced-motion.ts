import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Defaults to reduced motion until the OS preference is resolved so animated
 * components do not start moving before accessibility settings are applied.
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const updatePreference = (nextValue: boolean) => {
      if (isMounted) {
        setPrefersReducedMotion(nextValue);
      }
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then(updatePreference)
      .catch(() => updatePreference(false));

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      updatePreference,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return prefersReducedMotion;
}
