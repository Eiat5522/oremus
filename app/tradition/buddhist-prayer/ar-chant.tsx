import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BuddhistAltar3D,
  ChantTextBlock,
  ProgressPill,
  SacredHeader,
  SessionControls,
} from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useChantAutoAdvance } from '@/hooks/use-chant-auto-advance';
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

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <SacredHeader
        title={currentChant.title}
        subtitle={currentChant.subtitle}
        showBackButton
        onBack={() => router.back()}
      />

      {/* Altar — top 40% */}
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
          onReplay={replayVerse}
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
  progressBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BuddhistPrayerColors.goldPrimary,
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
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
    gap: BuddhistPrayerSpacing.lg,
  },
  textBlock: {
    alignItems: 'center',
  },
  controlsContainer: {
    paddingBottom: BuddhistPrayerSpacing.xl,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    gap: BuddhistPrayerSpacing.xs,
  },
  lastVerseHint: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
