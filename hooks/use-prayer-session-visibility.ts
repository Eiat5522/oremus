import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

type VisibilityOptions = {
  /**
   * Time in milliseconds before controls fade out after the last interaction.
   */
  idleDelayMs?: number;
};

function createOpacityAnimation(target: Animated.Value, toValue: number) {
  return Animated.timing(target, {
    toValue,
    duration: 260,
    useNativeDriver: true,
  });
}

export function usePrayerSessionVisibilityControls(options: VisibilityOptions = {}) {
  const { idleDelayMs = 3200 } = options;
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const hide = () => {
    setVisible(false);
    createOpacityAnimation(opacity, 0).start();
  };

  const scheduleHide = () => {
    clearTimer();
    timerRef.current = setTimeout(hide, idleDelayMs);
  };

  const reveal = () => {
    setVisible(true);
    createOpacityAnimation(opacity, 1).start();
    scheduleHide();
  };

  useEffect(() => {
    scheduleHide();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleDelayMs]);

  return {
    controlsVisible: visible,
    controlOpacity: opacity,
    hideControls: hide,
    revealControls: reveal,
  };
}
