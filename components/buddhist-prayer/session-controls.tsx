import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface SessionControlsProps {
  isPlaying: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReplay: () => void;
}

export function SessionControls({
  isPlaying,
  hasPrevious,
  hasNext,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onReplay,
}: SessionControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onReplay}
        style={styles.sideButton}
        accessibilityRole="button"
        accessibilityLabel="Replay verse"
        accessibilityHint="Restarts the current verse from the beginning."
      >
        <IconSymbol
          name="arrow.counterclockwise"
          size={22}
          color={BuddhistPrayerColors.textSecondary}
        />
      </Pressable>

      <Pressable
        onPress={onPrevious}
        disabled={!hasPrevious}
        style={[styles.sideButton, !hasPrevious && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Previous verse"
        accessibilityHint="Returns to the previous verse in this chant."
        accessibilityState={{ disabled: !hasPrevious }}
      >
        <IconSymbol
          name="backward.end.fill"
          size={24}
          color={hasPrevious ? BuddhistPrayerColors.textPrimary : BuddhistPrayerColors.textMuted}
        />
      </Pressable>

      <Pressable
        onPress={isPlaying ? onPause : onPlay}
        style={styles.playButton}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause session' : 'Play session'}
        accessibilityHint={
          isPlaying ? 'Pauses automatic verse playback.' : 'Resumes automatic verse playback.'
        }
      >
        <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={32} color="#FFFFFF" />
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={!hasNext}
        style={[styles.sideButton, !hasNext && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Next verse"
        accessibilityHint="Advances to the next verse or dedication screen."
        accessibilityState={{ disabled: !hasNext }}
      >
        <IconSymbol
          name="forward.end.fill"
          size={24}
          color={hasNext ? BuddhistPrayerColors.textPrimary : BuddhistPrayerColors.textMuted}
        />
      </Pressable>

      <View style={styles.sideButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.md,
  },
  sideButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  playButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: BuddhistPrayerColors.goldSecondary,
  },
  disabled: {
    opacity: 0.4,
  },
});
