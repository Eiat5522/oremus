import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChristianSessionControls } from '@/components/christian-prayer';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChristianPrayerColors, getChristianPrayerTemplate } from '@/constants/christian-prayer';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useChristianPrayerAudio } from '@/hooks/use-christian-prayer-audio';
import { useChristianPrayerAutoAdvance } from '@/hooks/use-christian-prayer-auto-advance';
import { useChristianPrayerSession } from '@/hooks/use-christian-prayer-session';
import { usePrayerSessionVisibilityControls } from '@/hooks/use-prayer-session-visibility-controls';

function getStageKindLabel(kind: string) {
  switch (kind) {
    case 'scripture':
      return 'Scripture';
    case 'reflection':
      return 'Reflection';
    case 'prayer':
      return 'Prayer';
    case 'stillness':
      return 'Stillness';
    case 'blessing':
      return 'Blessing';
    default:
      return 'Stage';
  }
}

export default function ChristianSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const uiTheme = useMemo(() => getTraditionUiTheme('christianity'), []);
  const { controlsOpacity, reveal } = usePrayerSessionVisibilityControls();
  const {
    selectedTemplateId,
    currentStageIndex,
    stageReplayToken,
    autoAdvance,
    ambientAudioEnabled,
    showScriptureFirst,
    isPlaying,
    isPaused,
    sessionStartedAt,
    currentTemplate,
    currentStage,
    totalStages,
    hasPreviousStage,
    hasNextStage,
    pauseSession,
    resumeSession,
    previousStage,
    nextStage,
    replayStage,
  } = useChristianPrayerSession();
  const { audioError, play, pause } = useChristianPrayerAudio(ambientAudioEnabled);

  useKeepAwake();

  const routeTemplate = useMemo(() => getChristianPrayerTemplate(templateId), [templateId]);

  useEffect(() => {
    if (
      !routeTemplate ||
      routeTemplate.id !== selectedTemplateId ||
      !sessionStartedAt ||
      !currentTemplate ||
      !currentStage
    ) {
      router.replace('/tradition/christian' as never);
    }
  }, [currentStage, currentTemplate, routeTemplate, router, selectedTemplateId, sessionStartedAt]);

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const handleAdvance = useCallback(() => {
    if (!currentTemplate) {
      return;
    }

    if (hasNextStage) {
      nextStage(currentTemplate.stages.length);
      return;
    }

    router.replace('/tradition/christian-completion' as never);
  }, [currentTemplate, hasNextStage, nextStage, router]);

  useChristianPrayerAutoAdvance({
    enabled: autoAdvance,
    isPlaying,
    stageKey: `${currentStage?.id ?? 'missing'}:${stageReplayToken}`,
    durationMs: (currentStage?.durationSeconds ?? 28) * 1000,
    onAdvance: handleAdvance,
  });

  useEffect(() => {
    if (!currentStage) {
      return;
    }

    if (isPlaying) {
      void play();
      return;
    }

    pause();
  }, [currentStage, isPlaying, pause, play]);

  if (
    !routeTemplate ||
    routeTemplate.id !== selectedTemplateId ||
    !sessionStartedAt ||
    !currentTemplate ||
    !currentStage
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={uiTheme.backgroundImage}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(94, 57, 28, 0.18)', 'rgba(37, 20, 12, 0.78)', 'rgba(16, 9, 7, 0.97)']}
        style={StyleSheet.absoluteFillObject}
      />

      <Pressable onPress={reveal} style={styles.touchLayer}>
        <View
          style={[styles.scene, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 20 }]}
        >
          <Animated.View style={[styles.topOverlay, controlsAnimatedStyle]}>
            <View style={styles.topRow}>
              <View style={styles.stageBadge}>
                <ThemedText style={styles.stageBadgeText}>
                  Stage {currentStageIndex + 1}/{totalStages}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => router.replace('/tradition/christian' as never)}
                style={styles.closeButton}
              >
                <IconSymbol name="close" size={18} color={ChristianPrayerColors.textPrimary} />
              </Pressable>
            </View>
            <ThemedText style={styles.sessionTitle}>{currentTemplate.title}</ThemedText>
            <ThemedText style={styles.sessionSubtitle}>
              {isPaused ? 'Paused' : 'Prayer in progress'}
            </ThemedText>
          </Animated.View>

          <View style={styles.centerContent}>
            <View style={styles.kindPill}>
              <ThemedText style={styles.kindPillText}>
                {getStageKindLabel(currentStage.kind)}
              </ThemedText>
            </View>

            <View style={styles.stageCard}>
              <ThemedText style={styles.stageTitle}>{currentStage.title}</ThemedText>

              {showScriptureFirst && currentStage.scripture ? (
                <View style={styles.scriptureBlock}>
                  <ThemedText style={styles.scriptureText}>
                    &quot;{currentStage.scripture.text}&quot;
                  </ThemedText>
                  <ThemedText style={styles.scriptureReference}>
                    {currentStage.scripture.reference}
                  </ThemedText>
                </View>
              ) : null}

              <ThemedText style={styles.stageBody}>{currentStage.body}</ThemedText>

              {!showScriptureFirst && currentStage.scripture ? (
                <View style={styles.scriptureBlock}>
                  <ThemedText style={styles.scriptureText}>
                    &quot;{currentStage.scripture.text}&quot;
                  </ThemedText>
                  <ThemedText style={styles.scriptureReference}>
                    {currentStage.scripture.reference}
                  </ThemedText>
                </View>
              ) : null}

              {currentStage.reflectionPrompt ? (
                <View style={styles.reflectionCard}>
                  <ThemedText style={styles.reflectionLabel}>Sit with this</ThemedText>
                  <ThemedText style={styles.reflectionPrompt}>
                    {currentStage.reflectionPrompt}
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.stageFooter}>
                <ThemedText style={styles.stageHint}>
                  {currentStage.kind === 'stillness'
                    ? 'Stay with your breath and remain unhurried.'
                    : 'Move slowly. Let each line become prayer.'}
                </ThemedText>
                <ThemedText style={styles.stageDuration}>
                  {currentStage.durationSeconds ?? 28}s
                </ThemedText>
              </View>
            </View>

            {audioError ? <ThemedText style={styles.audioError}>{audioError}</ThemedText> : null}
          </View>

          <ChristianSessionControls
            animatedStyle={controlsAnimatedStyle}
            isPlaying={isPlaying}
            hasPrevious={hasPreviousStage}
            hasNext={hasNextStage}
            onReplay={replayStage}
            onPrevious={previousStage}
            onPlayPause={() => {
              if (isPlaying) {
                pauseSession();
              } else {
                resumeSession();
              }
            }}
            onNext={handleAdvance}
            onEndSession={() => router.replace('/tradition/christian-completion' as never)}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChristianPrayerColors.background,
  },
  touchLayer: {
    flex: 1,
  },
  scene: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 16,
  },
  topOverlay: {
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  stageBadgeText: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  sessionTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  sessionSubtitle: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  kindPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(242,196,124,0.12)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  kindPillText: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  stageCard: {
    width: '100%',
    borderRadius: 28,
    padding: 22,
    gap: 16,
    backgroundColor: 'rgba(65, 39, 27, 0.78)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  stageTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  scriptureBlock: {
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  scriptureText: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 18,
    lineHeight: 30,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scriptureReference: {
    color: ChristianPrayerColors.gold,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  stageBody: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  reflectionCard: {
    gap: 6,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  reflectionLabel: {
    color: ChristianPrayerColors.gold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '800',
    textAlign: 'center',
  },
  reflectionPrompt: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  stageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  stageHint: {
    flex: 1,
    color: ChristianPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  stageDuration: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  audioError: {
    color: '#F7C5B7',
    fontSize: 13,
    textAlign: 'center',
  },
});
