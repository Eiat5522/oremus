import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type PrayerSessionControlsProps = {
  /** Reanimated shared-value opacity – injected by the visibility hook. */
  animatedStyle: object;
  onEndSession: () => void;
  onPause?: () => void;
  isPaused?: boolean;
  onEmergencyExit: () => void;
};

/**
 * Minimal session controls overlay.
 *
 * Visibility is driven by an animated opacity (from usePrayerSessionVisibilityControls).
 * The controls fade after ~3 s of idle and reappear on tap anywhere on screen.
 *
 * Touch targets are at least 44 × 44 pt (WCAG 2.5.5 / Apple HIG).
 */
export function PrayerSessionControls({
  animatedStyle,
  onEndSession,
  onPause,
  isPaused = false,
  onEmergencyExit,
}: PrayerSessionControlsProps) {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Primary: End Session */}
      <Pressable
        onPress={onEndSession}
        style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}
        accessibilityLabel="End prayer session"
        accessibilityRole="button"
        hitSlop={8}
      >
        <ThemedText style={styles.endButtonText}>End Session</ThemedText>
      </Pressable>

      <View style={styles.secondaryRow}>
        {/* Optional Pause */}
        {onPause ? (
          <Pressable
            onPress={onPause}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            accessibilityLabel={isPaused ? 'Resume prayer session' : 'Pause prayer session'}
            accessibilityRole="button"
            hitSlop={8}
          >
            <IconSymbol
              name={isPaused ? 'play.fill' : 'pause.fill'}
              size={16}
              color="rgba(255,240,180,0.70)"
            />
            <ThemedText style={styles.secondaryText}>{isPaused ? 'Resume' : 'Pause'}</ThemedText>
          </Pressable>
        ) : null}

        {/* Emergency exit – lowest visual emphasis */}
        <Pressable
          onPress={onEmergencyExit}
          style={({ pressed }) => [styles.exitButton, pressed && styles.pressed]}
          accessibilityLabel="Exit session immediately"
          accessibilityRole="button"
          hitSlop={12}
        >
          <ThemedText style={styles.exitText}>Exit</ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  endButton: {
    height: 52,
    paddingHorizontal: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,220,100,0.35)',
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  endButtonText: {
    color: 'rgba(255,240,180,0.90)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  secondaryText: {
    color: 'rgba(255,240,180,0.70)',
    fontSize: 13,
    fontWeight: '500',
  },
  exitButton: {
    height: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
