import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ChantOverlay,
  BuddhistAltar3D,
  ChantTextBlock,
  SacredHeader,
  SessionControls,
} from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useChantAutoAdvance } from '@/hooks/use-chant-auto-advance';
import { useAudioPrayer } from '@/hooks/use-audio-prayer';
import { useChantSession } from '@/hooks/use-chant-session';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

export default function ARChantScreen() {
  const router = useRouter();
  const placementScale = useBuddhistPrayerStore((state) => state.placementScale);
  const placementRotation = useBuddhistPrayerStore((state) => state.placementRotation);

  const {
    currentChant,
    currentVerse,
    currentVerseIndex,
    totalVerses,
    hasNextVerse,
    hasPreviousVerse,
    autoScroll,
    isPlaying,
    showMeaning,
    progress,
    nextVerse,
    previousVerse,
    replayVerse,
    pauseSession,
    resumeSession,
  } = useChantSession();
  const { play, pause, playTempleBell } = useAudioPrayer();
  const previousIsPlayingRef = useRef(isPlaying);
  const previousVerseIndexRef = useRef(currentVerseIndex);

  const isLastVerse = !hasNextVerse;
  const autoAdvanceDurationMs = useMemo(() => {
    if (!currentChant) return 8000;
    const perVerseSeconds = currentChant.durationSeconds / Math.max(currentChant.verses.length, 1);
    return Math.min(Math.max(Math.round(perVerseSeconds * 1000), 5000), 20000);
  }, [currentChant]);

  useEffect(() => {
    if (!currentChant) {
      router.replace('/tradition/buddhist-prayer');
    }
  }, [currentChant, router]);

  const handleNext = () => {
    if (isLastVerse) {
      playTempleBell();
      pause();
      router.push('/tradition/buddhist-prayer/ar-merit');
    } else {
      nextVerse(totalVerses);
    }
  };

  useChantAutoAdvance({
    autoScroll: autoScroll && Boolean(currentChant && currentVerse),
    isPlaying,
    verseKey: currentVerse?.id ?? currentVerseIndex,
    hasNextVerse,
    durationMs: autoAdvanceDurationMs,
    onAdvance: handleNext,
  });

  // Ambient chant playback tied to session play state
  useEffect(() => {
    if (!currentChant || !currentVerse) return;

    if (isPlaying && !previousIsPlayingRef.current) {
      playTempleBell();
      void play();
    }

    if (!isPlaying && previousIsPlayingRef.current) {
      pause();
    }

    previousIsPlayingRef.current = isPlaying;
  }, [currentChant, currentVerse, isPlaying, pause, play, playTempleBell]);

  // Bell + restart on verse transitions while playing
  useEffect(() => {
    if (!isPlaying) {
      previousVerseIndexRef.current = currentVerseIndex;
      return;
    }

    if (currentVerseIndex !== previousVerseIndexRef.current) {
      previousVerseIndexRef.current = currentVerseIndex;
      playTempleBell();
      void play();
    }
  }, [currentVerseIndex, isPlaying, play, playTempleBell]);

  const handleReplay = () => {
    playTempleBell();
    void play();
    replayVerse();
  };

  if (!currentChant || !currentVerse) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ThemedText style={styles.waitText}>Loading session…</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader
        title="AR Chant Session"
        subtitle="Your altar will stay present as you recite."
        showBackButton
        onBack={() => router.back()}
      />

      <View style={styles.altarArea}>
        <BuddhistAltar3D
          scale={placementScale}
          rotation={placementRotation}
          showHalo
          style={styles.altar}
        />
      </View>

      {/* Verse content */}
      <View style={styles.verseContainer}>
        <ProgressPill current={currentVerseIndex + 1} total={totalVerses} />

        <View style={styles.textBlock}>
          <ChantTextBlock
            thai={currentVerse.thai}
            pali={currentVerse.pali}
            english={currentVerse.english}
            transliteration={currentVerse.transliteration}
            meaning={currentVerse.meaning}
            showMeaning={showMeaning}
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <SessionControls
          isPlaying={isPlaying}
          hasPrevious={hasPreviousVerse}
          hasNext
          onPlay={resumeSession}
          onPause={pauseSession}
          onPrevious={previousVerse}
          onNext={handleNext}
          onReplay={handleReplay}
        />
        {isLastVerse ? (
          <ThemedText style={styles.lastVerseHint}>Tap ▶▶ to dedicate your merit</ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 15,
  },
  altarArea: {
    height: '36%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  overlayArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.xl,
    gap: BuddhistPrayerSpacing.sm,
  },
  lastVerseHint: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
