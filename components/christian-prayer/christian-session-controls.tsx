import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChristianPrayerColors } from '@/constants/christian-prayer';

interface ChristianSessionControlsProps {
  animatedStyle: object;
  isPlaying: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onReplay: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onEndSession: () => void;
}

export function ChristianSessionControls({
  animatedStyle,
  isPlaying,
  hasPrevious,
  hasNext,
  onReplay,
  onPrevious,
  onPlayPause,
  onNext,
  onEndSession,
}: ChristianSessionControlsProps) {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.controlsRow}>
        <Pressable
          onPress={onReplay}
          style={styles.sideButton}
          accessibilityRole="button"
          accessibilityLabel="Replay stage"
        >
          <IconSymbol
            name="arrow.counterclockwise"
            size={22}
            color={ChristianPrayerColors.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={onPrevious}
          disabled={!hasPrevious}
          style={[styles.sideButton, !hasPrevious && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Previous stage"
          accessibilityState={{ disabled: !hasPrevious }}
        >
          <IconSymbol
            name="backward.end.fill"
            size={24}
            color={
              hasPrevious ? ChristianPrayerColors.textPrimary : ChristianPrayerColors.textMuted
            }
          />
        </Pressable>

        <Pressable
          onPress={onPlayPause}
          style={styles.playButton}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause prayer' : 'Resume prayer'}
        >
          <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={30} color="#2F1A10" />
        </Pressable>

        <Pressable
          onPress={onNext}
          style={styles.sideButton}
          accessibilityRole="button"
          accessibilityLabel={hasNext ? 'Next stage' : 'Finish prayer'}
        >
          <IconSymbol
            name="forward.end.fill"
            size={24}
            color={hasNext ? ChristianPrayerColors.textPrimary : ChristianPrayerColors.gold}
          />
        </Pressable>

        <View style={styles.sideButtonPlaceholder} />
      </View>

      <Pressable
        onPress={onEndSession}
        style={styles.endButton}
        accessibilityRole="button"
        accessibilityLabel="End prayer session"
      >
        <ThemedText style={styles.endButtonText}>End Session</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  sideButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  sideButtonPlaceholder: {
    width: 46,
    height: 46,
  },
  playButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ChristianPrayerColors.gold,
  },
  endButton: {
    alignSelf: 'center',
    minWidth: 180,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 176, 0.1)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  endButtonText: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.38,
  },
});
