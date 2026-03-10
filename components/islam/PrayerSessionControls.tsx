import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type PrayerSessionControlsProps = {
  opacity: Animated.Value | Animated.AnimatedInterpolation<number>;
  onEndSession: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  onEmergencyExit?: () => void;
};

export function PrayerSessionControls({
  opacity,
  onEndSession,
  onTogglePause,
  isPaused = false,
  onEmergencyExit,
}: PrayerSessionControlsProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 12,
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.buttonRow}>
        {onTogglePause ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume prayer session' : 'Pause prayer session'}
            onPress={onTogglePause}
            style={({ pressed }) => [
              styles.controlButton,
              styles.secondary,
              pressed && styles.pressed,
            ]}
          >
            <IconSymbol name={isPaused ? 'play.fill' : 'pause.fill'} size={16} color="#F7E9C0" />
            <ThemedText style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</ThemedText>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End prayer session"
          onPress={onEndSession}
          style={({ pressed }) => [styles.controlButton, styles.primary, pressed && styles.pressed]}
        >
          <IconSymbol name="stop.fill" size={16} color="#0C0D0D" />
          <ThemedText style={[styles.buttonText, styles.primaryLabel]}>End Session</ThemedText>
        </Pressable>
      </View>

      {onEmergencyExit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Emergency exit"
          onPress={onEmergencyExit}
          style={({ pressed }) => [styles.emergency, pressed && styles.emergencyPressed]}
        >
          <ThemedText style={styles.emergencyText}>Emergency Exit</ThemedText>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  controlButton: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: '#F7E5A2',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  primaryLabel: {
    color: '#0A0B0C',
    fontWeight: '800',
  },
  secondary: {
    backgroundColor: 'rgba(8, 24, 18, 0.46)',
    borderColor: 'rgba(247, 229, 162, 0.2)',
  },
  buttonText: {
    color: '#F7E9C0',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  emergency: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  emergencyPressed: {
    opacity: 0.7,
  },
  emergencyText: {
    color: 'rgba(247, 233, 192, 0.74)',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
