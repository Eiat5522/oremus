import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  ArIntroIllustration,
  BlessingCard,
  BottomSheetContainer,
  ChristianArViewport,
  ChristianFlowScreen,
  ChristianSessionHero,
  CompletionSummaryCard,
  DurationChipGroup,
  FloatingConfirmationCard,
  FloatingScriptureCard,
  GlassCard,
  IconCircleButton,
  PrayerCornerScene,
  PrayerPhaseCard,
  PrayerStepper,
  PrimaryButton,
  ReflectionEditor,
  ReflectionPromptCard,
  SecondaryButton,
  SelectedModeCard,
  SessionModeList,
  StillnessOverlay,
  ToggleRow,
  TopOverlayHeader,
  VersePreviewCard,
} from '@/features/christian-prayer/components';
import {
  CHRISTIAN_SCENE_STYLE_BY_PHASE,
  ChristianPrayerPalette,
  ChristianPrayerSpacing,
  type ChristianExperienceMode,
} from '@/features/christian-prayer/constants';
import { useChristianArController } from '@/features/christian-prayer/hooks/useChristianArController';
import { useChristianExitGuard } from '@/features/christian-prayer/hooks/useChristianExitGuard';
import { useChristianPhaseNavigation } from '@/features/christian-prayer/hooks/useChristianPhaseNavigation';
import { useChristianPrayerSession } from '@/features/christian-prayer/hooks/useChristianPrayerSession';
import { useChristianRouteSync } from '@/features/christian-prayer/hooks/useChristianRouteSync';
import { getChristianModeOptions } from '@/features/christian-prayer/services/christianContent.service';
import { trackChristianAnalyticsEvent } from '@/features/christian-prayer/services/christianAnalytics.service';
import { useChristianAudioService } from '@/features/christian-prayer/services/christianAudio.service';
import {
  clearChristianReflectionDraft,
  saveChristianReflectionDraft,
  saveCompletedChristianSession,
  saveFavoriteChristianVerse,
} from '@/features/christian-prayer/services/christianPersistence.service';
import {
  buildChristianSessionSummary,
  getChristianResumeRoute,
  resolveChristianModeFromLegacyTemplate,
} from '@/features/christian-prayer/services/christianSession.service';
import {
  triggerChristianCompletionHaptic,
  triggerChristianSurfaceDetectedHaptic,
} from '@/features/christian-prayer/services/christianHaptics.service';
import {
  CHRISTIAN_GUIDED_PRAYER_PHASES,
  isGuidedPrayerPhase,
} from '@/features/christian-prayer/utils/phase';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';

const REFLECTION_TAG_OPTIONS = ['peace', 'grace', 'gratitude', 'strength', 'mercy', 'rest'];
const SILENT_TIMER_OPTIONS = [null, 1, 2, 3] as const;

function useChristianModeGuard() {
  const router = useRouter();
  const mode = useChristianSessionStore((state) => state.mode);

  useEffect(() => {
    if (!mode) {
      router.replace('/christian' as never);
    }
  }, [mode, router]);

  return mode;
}

function ExperienceSceneFrame({
  experienceMode,
  children,
  floatingPrompts,
}: {
  experienceMode: ChristianExperienceMode;
  children: React.ReactNode;
  floatingPrompts?: string[];
}) {
  const session = useChristianPrayerSession();
  const sceneStyle = CHRISTIAN_SCENE_STYLE_BY_PHASE[session.currentPhase];

  if (experienceMode === 'ar') {
    return (
      <ChristianArViewport
        cameraGranted={session.cameraPermission === 'granted'}
        floatingPrompts={floatingPrompts}
        placementState={session.arPlacement}
        sceneStyle={sceneStyle}
      />
    );
  }

  return (
    <PrayerCornerScene floatingPrompts={floatingPrompts} sceneStyle={sceneStyle}>
      {children}
    </PrayerCornerScene>
  );
}

export function ChristianPrayerStartScreen() {
  useChristianRouteSync('/christian');
  const router = useRouter();
  const {
    completionSummary,
    currentPhase,
    currentRoute,
    experienceMode,
    isCompleted,
    isInterrupted,
    isDraft,
    mode,
    sessionStartedAtMs,
    createDraftSession,
    resetSession,
    updateSetupSelections,
  } = useChristianSessionStore();
  const modeOptions = useMemo(() => getChristianModeOptions(), []);
  const activeMode = mode ?? 'dailyScripture';
  const activeContent = useMemo(
    () => modeOptions.find((item) => item.mode === activeMode) ?? modeOptions[0] ?? null,
    [activeMode, modeOptions],
  );
  const resumeRoute = getChristianResumeRoute({
    currentRoute,
    experienceMode,
    currentPhase,
    isCompleted,
    isDraft,
  });

  useEffect(() => {
    if (!mode) {
      createDraftSession(activeMode);
    }
  }, [activeMode, createDraftSession, mode]);

  if (!activeContent) {
    return null;
  }

  const showResumeCard = Boolean(
    mode &&
    ((sessionStartedAtMs && !isCompleted) || isInterrupted || (isCompleted && completionSummary)),
  );

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Christian Prayer Corner" />
      <ChristianSessionHero verse={activeContent.heroVerse} />

      {showResumeCard ? (
        <GlassCard>
          <ThemedText style={styles.sectionLabel}>
            {isCompleted
              ? 'Last Session'
              : isInterrupted
                ? 'Interrupted Session'
                : 'Continue Session'}
          </ThemedText>
          <ThemedText style={styles.sectionTitle}>{activeContent.title}</ThemedText>
          <ThemedText style={styles.sectionBody}>
            {isCompleted
              ? 'Your last prayer corner session is saved and ready to revisit.'
              : 'Resume where you left off, or begin again with a fresh arrival.'}
          </ThemedText>
          <View style={styles.actionStack}>
            <PrimaryButton
              label={isCompleted ? 'View Completion' : 'Resume'}
              onPress={() => router.push(resumeRoute as never)}
            />
            <SecondaryButton
              label="Start Over"
              onPress={() => {
                resetSession();
                createDraftSession(activeMode);
                router.push('/christian/setup' as never);
              }}
            />
          </View>
        </GlassCard>
      ) : null}

      <View style={styles.sectionBlock}>
        <ThemedText style={styles.sectionLabel}>Prayer Journeys</ThemedText>
        <ThemedText style={styles.sectionBody}>
          Arrival, quiet, scripture, reflection, prayer, peace, and completion.
        </ThemedText>
      </View>

      <SessionModeList
        activeMode={activeMode}
        items={modeOptions}
        onSelect={(nextMode) => {
          createDraftSession(nextMode);
          updateSetupSelections({ mode: nextMode });
        }}
      />
      <SelectedModeCard content={activeContent} />
      <PrimaryButton
        label="Continue To Setup"
        onPress={() => router.push('/christian/setup' as never)}
      />
    </ChristianFlowScreen>
  );
}

export function ChristianPrayerSetupScreen() {
  useChristianRouteSync('/christian/setup');
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();

  if (!mode || !session.modeContent || !session.selectedVerse) {
    return null;
  }

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Session Setup" onBack={() => router.back()} />
      <SelectedModeCard content={session.modeContent} />
      <GlassCard>
        <ThemedText style={styles.sectionLabel}>Duration</ThemedText>
        <DurationChipGroup
          value={session.durationMinutes}
          onChange={(durationMinutes) => session.updateSetupSelections({ durationMinutes })}
        />
      </GlassCard>
      <VersePreviewCard verse={session.selectedVerse} />
      <GlassCard style={styles.toggleCard}>
        <ThemedText style={styles.sectionLabel}>Experience Settings</ThemedText>
        <ToggleRow
          title="Narration"
          description="Replay scripture and prayer prompts with gentle voice guidance."
          value={session.audioSettings.narrationEnabled}
          onValueChange={(value) =>
            session.updateSetupSelections({
              audioSettings: { narrationEnabled: value },
            })
          }
        />
        <ToggleRow
          title="Ambient Audio"
          description="Keep a low ambient prayer tone underneath the journey."
          value={session.audioSettings.ambientEnabled}
          onValueChange={(value) =>
            session.updateSetupSelections({
              audioSettings: { ambientEnabled: value },
            })
          }
        />
        <ToggleRow
          title="Haptics"
          description="Use subtle haptics for milestones like placement and completion."
          value={session.audioSettings.hapticsEnabled}
          onValueChange={(value) =>
            session.updateSetupSelections({
              audioSettings: { hapticsEnabled: value },
            })
          }
        />
        <ToggleRow
          title="Reflection Prompts"
          description="Keep guided reflection copy visible during the reflection screen."
          value={session.audioSettings.reflectionPromptsEnabled}
          onValueChange={(value) =>
            session.updateSetupSelections({
              audioSettings: { reflectionPromptsEnabled: value },
            })
          }
        />
      </GlassCard>
      <PrimaryButton
        label="Continue To AR Intro"
        onPress={() => router.push('/christian/ar-intro' as never)}
      />
    </ChristianFlowScreen>
  );
}

export function ChristianArIntroScreen() {
  useChristianRouteSync('/christian/ar-intro');
  const router = useRouter();
  const mode = useChristianModeGuard();
  const setCameraPermission = useChristianSessionStore((state) => state.setCameraPermission);
  const setExperienceMode = useChristianSessionStore((state) => state.setExperienceMode);
  const [permission, requestPermission] = useSafeCameraPermissions();

  useEffect(() => {
    if (permission?.status) {
      setCameraPermission(permission.status);
    }
  }, [permission?.status, setCameraPermission]);

  if (!mode) {
    return null;
  }

  const permissionGranted = permission?.granted === true;
  const permissionDenied = permission?.granted === false && !permission?.canAskAgain;

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="AR Intro" onBack={() => router.back()} />
      <GlassCard>
        <ArIntroIllustration />
        <ThemedText style={styles.sectionTitle}>
          Place a Christian prayer corner on a quiet surface.
        </ThemedText>
        <ThemedText style={styles.sectionBody}>
          We use the camera only to guide placement. If camera access is unavailable, you can
          continue in the 2D sanctuary without losing the prayer journey.
        </ThemedText>
      </GlassCard>
      {permissionDenied ? (
        <FloatingConfirmationCard
          body="Camera access is denied. Continue in the 2D sanctuary, or re-enable permission in system settings later."
          title="Camera Permission Denied"
        />
      ) : null}
      <View style={styles.actionStack}>
        {!permissionGranted ? (
          <PrimaryButton
            label="Allow Camera Access"
            onPress={() => {
              void requestPermission();
            }}
          />
        ) : (
          <PrimaryButton
            label="Continue To Surface Scan"
            onPress={() => router.push('/christian/ar-scan' as never)}
          />
        )}
        <SecondaryButton
          label="Use 2D Sanctuary"
          onPress={() => {
            setExperienceMode('fallback2d');
            router.replace('/christian-2d/index' as never);
          }}
        />
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianArScanScreen() {
  useChristianRouteSync('/christian/ar-scan');
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setExperienceMode = useChristianSessionStore((state) => state.setExperienceMode);
  const { initializeAndStart, resetPlacement, arPlacement } = useChristianArController({
    polling: true,
  });
  const surfaceEventRef = useRef(false);

  useEffect(() => {
    let retryCount = 0;

    const boot = async () => {
      if (session.cameraPermission !== 'granted') {
        setExperienceMode('fallback2d');
        router.replace('/christian-2d/index' as never);
        return;
      }

      setExperienceMode('ar');

      while (retryCount < 2) {
        const result = await initializeAndStart();
        if (result.supported) {
          return;
        }
        retryCount += 1;
      }

      setExperienceMode('fallback2d');
      router.replace('/christian-2d/index' as never);
    };

    if (mode) {
      void boot();
    }
  }, [initializeAndStart, mode, router, session.cameraPermission, setExperienceMode]);

  useEffect(() => {
    if (arPlacement.status === 'surfaceDetected' && !surfaceEventRef.current) {
      surfaceEventRef.current = true;
      void trackChristianAnalyticsEvent({
        type: 'ar_surface_detected',
        sessionId: session.sessionId,
        mode: session.mode,
        phase: session.currentPhase,
      });
      void triggerChristianSurfaceDetectedHaptic(session.audioSettings.hapticsEnabled);
    }
  }, [
    arPlacement.status,
    session.audioSettings.hapticsEnabled,
    session.currentPhase,
    session.mode,
    session.sessionId,
  ]);

  if (!mode) {
    return null;
  }

  return (
    <ChristianFlowScreen scrollable={false}>
      <TopOverlayHeader title="Surface Scan" onBack={() => router.back()} />
      <View style={styles.flex}>
        <ChristianArViewport
          cameraGranted={session.cameraPermission === 'granted'}
          floatingPrompts={['central cross', 'open Bible', 'candles']}
          placementState={arPlacement}
          sceneStyle={CHRISTIAN_SCENE_STYLE_BY_PHASE.idle}
        />
        <BottomSheetContainer>
          <ThemedText style={styles.sectionTitle}>Find a quiet surface.</ThemedText>
          <ThemedText style={styles.sectionBody}>
            Move the phone slowly so the prayer corner can settle into the room without haste.
          </ThemedText>
          {arPlacement.status === 'trackingWeak' ? (
            <FloatingConfirmationCard
              title="Tracking Is Weak"
              body="Keep a little more distance and let the camera see the full surface."
            />
          ) : null}
          <View style={styles.actionStack}>
            {arPlacement.canPlace ? (
              <PrimaryButton
                label="Continue To Placement"
                onPress={() => router.push('/christian/ar-place' as never)}
              />
            ) : (
              <SecondaryButton
                label="Reset Scan"
                onPress={() => {
                  void resetPlacement();
                }}
              />
            )}
            <SecondaryButton
              label="Use 2D Sanctuary"
              onPress={() => {
                setExperienceMode('fallback2d');
                router.replace('/christian-2d/index' as never);
              }}
            />
          </View>
        </BottomSheetContainer>
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianArPlaceScreen() {
  useChristianRouteSync('/christian/ar-place');
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const { arPlacement, placePrayerCorner, resetPlacement, updatePrayerCorner } =
    useChristianArController({
      polling: true,
    });
  const placementTrackedRef = useRef(false);

  if (!mode) {
    return null;
  }

  const confirmPlacement = async () => {
    try {
      const nextState = await placePrayerCorner();
      session.placePrayerCorner(nextState.transform);
      if (!placementTrackedRef.current) {
        placementTrackedRef.current = true;
        void trackChristianAnalyticsEvent({
          type: 'prayer_corner_placed',
          sessionId: session.sessionId,
          mode: session.mode,
          phase: session.currentPhase,
        });
      }
    } catch (error) {
      console.error('Failed to place prayer corner.', error);
      Alert.alert(
        'Unable to place prayer corner',
        'Try scanning the surface again before placing it.',
      );
    }
  };

  return (
    <ChristianFlowScreen scrollable={false}>
      <TopOverlayHeader title="Place Prayer Corner" onBack={() => router.back()} />
      <View style={styles.flex}>
        <ChristianArViewport
          cameraGranted={session.cameraPermission === 'granted'}
          floatingPrompts={['soft halo', 'floating prompts']}
          placementState={arPlacement}
          sceneStyle={CHRISTIAN_SCENE_STYLE_BY_PHASE.idle}
        />
        <BottomSheetContainer>
          <ThemedText style={styles.sectionTitle}>Set the corner with reverence.</ThemedText>
          <ThemedText style={styles.sectionBody}>
            Place first, then adjust scale or rotation until the scene feels quiet and centered.
          </ThemedText>
          {arPlacement.status === 'placementLost' ? (
            <FloatingConfirmationCard
              title="Placement Lost"
              body="Return to scanning if the surface needs to be found again."
            />
          ) : null}
          {!arPlacement.isPlaced ? (
            <PrimaryButton label="Place Prayer Corner" onPress={() => void confirmPlacement()} />
          ) : (
            <>
              <View style={styles.controlRow}>
                <IconCircleButton
                  accessibilityLabel="Rotate prayer corner left"
                  onPress={() =>
                    void updatePrayerCorner({ rotation: arPlacement.transform.rotation - 12 })
                  }
                >
                  <IconSymbol
                    color={ChristianPrayerPalette.textPrimary}
                    name="rotate.left"
                    size={18}
                  />
                </IconCircleButton>
                <IconCircleButton
                  accessibilityLabel="Decrease prayer corner size"
                  onPress={() =>
                    void updatePrayerCorner({
                      scale: Math.max(0.8, arPlacement.transform.scale - 0.08),
                    })
                  }
                >
                  <IconSymbol
                    color={ChristianPrayerPalette.textPrimary}
                    name="minus.magnifyingglass"
                    size={18}
                  />
                </IconCircleButton>
                <IconCircleButton
                  accessibilityLabel="Increase prayer corner size"
                  onPress={() =>
                    void updatePrayerCorner({
                      scale: Math.min(1.45, arPlacement.transform.scale + 0.08),
                    })
                  }
                >
                  <IconSymbol
                    color={ChristianPrayerPalette.textPrimary}
                    name="plus.magnifyingglass"
                    size={18}
                  />
                </IconCircleButton>
                <IconCircleButton
                  accessibilityLabel="Rotate prayer corner right"
                  onPress={() =>
                    void updatePrayerCorner({ rotation: arPlacement.transform.rotation + 12 })
                  }
                >
                  <IconSymbol
                    color={ChristianPrayerPalette.textPrimary}
                    name="rotate.right"
                    size={18}
                  />
                </IconCircleButton>
              </View>
              <PrimaryButton
                label="Confirm Placement"
                onPress={() => router.push('/christian/ar-ready' as never)}
              />
            </>
          )}
          <SecondaryButton
            label="Re-scan Surface"
            onPress={() => {
              void resetPlacement();
              router.replace('/christian/ar-scan' as never);
            }}
          />
        </BottomSheetContainer>
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianArReadyScreen() {
  useChristianRouteSync('/christian/ar-ready');
  useChristianExitGuard('/christian/ar-ready');
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const { beginPrayerFlow } = useChristianPhaseNavigation();

  if (!mode || !session.modeContent) {
    return null;
  }

  return (
    <ChristianFlowScreen scrollable={false}>
      <TopOverlayHeader
        title="Prayer Corner Ready"
        onClose={() => router.push('/christian/exit-confirm' as never)}
      />
      <View style={styles.flexCenter}>
        <ExperienceSceneFrame experienceMode="ar" floatingPrompts={['quiet', 'scripture', 'peace']}>
          <View />
        </ExperienceSceneFrame>
        <FloatingConfirmationCard
          title="Everything is settled."
          body={session.modeContent.arrivalPrompt}
        />
        <View style={styles.actionStack}>
          <PrimaryButton label="Begin Prayer Session" onPress={beginPrayerFlow} />
          <SecondaryButton
            label="Adjust Placement"
            onPress={() => router.replace('/christian/ar-place' as never)}
          />
        </View>
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianFallbackStartScreen() {
  useChristianRouteSync('/christian-2d/index');
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setExperienceMode = useChristianSessionStore((state) => state.setExperienceMode);
  const { beginPrayerFlow } = useChristianPhaseNavigation();

  useEffect(() => {
    setExperienceMode('fallback2d');
  }, [setExperienceMode]);

  if (!mode || !session.modeContent) {
    return null;
  }

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="2D Sanctuary" />
      <ExperienceSceneFrame
        experienceMode="fallback2d"
        floatingPrompts={['cross', 'Bible', 'candles']}
      >
        <View />
      </ExperienceSceneFrame>
      <FloatingConfirmationCard
        title="A quiet sanctuary is ready."
        body="AR is unavailable right now, but the full Christian prayer journey continues here with the same phases and completion flow."
      />
      <PrimaryButton label="Begin Prayer Session" onPress={beginPrayerFlow} />
    </ChristianFlowScreen>
  );
}

export function ChristianStillnessScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/stillness' : '/christian/stillness',
  );
  useChristianExitGuard(
    experienceMode === 'fallback2d' ? '/christian-2d/stillness' : '/christian/stillness',
  );
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setCurrentPhase = useChristianSessionStore((state) => state.setCurrentPhase);
  const { advanceToNextPhase } = useChristianPhaseNavigation();
  const { playAmbient } = useChristianAudioService(session.audioSettings);
  const [remainingSeconds, setRemainingSeconds] = useState(12);
  const hasAdvancedRef = useRef(false);

  useEffect(() => {
    setCurrentPhase('openingStillness');
    hasAdvancedRef.current = false;
    const interval = setInterval(() => {
      setRemainingSeconds((previous) => {
        const nextValue = Math.max(0, previous - 1);
        if (nextValue === 0) {
          clearInterval(interval);
        }
        return nextValue;
      });
    }, 1000);

    void playAmbient();

    return () => {
      clearInterval(interval);
    };
  }, [playAmbient, setCurrentPhase]);

  useEffect(() => {
    if (remainingSeconds !== 0 || hasAdvancedRef.current) {
      return;
    }

    hasAdvancedRef.current = true;
    advanceToNextPhase();
  }, [advanceToNextPhase, remainingSeconds]);

  if (!mode || !session.modeContent) {
    return null;
  }

  return (
    <ChristianFlowScreen scrollable={false}>
      <TopOverlayHeader
        title="Opening Stillness"
        onClose={() => router.push('/christian/exit-confirm' as never)}
      />
      <View style={styles.experienceContent}>
        <ExperienceSceneFrame
          experienceMode={experienceMode}
          floatingPrompts={['arrival', 'quiet']}
        >
          <View />
        </ExperienceSceneFrame>
        <StillnessOverlay
          body={session.modeContent.stillnessPrompt}
          remainingSeconds={remainingSeconds}
          title="Stay here a little longer."
          totalSeconds={12}
        />
        <SecondaryButton label="Skip" onPress={advanceToNextPhase} />
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianScriptureScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/scripture' : '/christian/scripture',
  );
  useChristianExitGuard(
    experienceMode === 'fallback2d' ? '/christian-2d/scripture' : '/christian/scripture',
  );
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setCurrentPhase = useChristianSessionStore((state) => state.setCurrentPhase);
  const { advanceToNextPhase } = useChristianPhaseNavigation();
  const { playAmbient, replayNarration } = useChristianAudioService(session.audioSettings);

  useEffect(() => {
    setCurrentPhase('scripture');
    void playAmbient();
  }, [playAmbient, setCurrentPhase]);

  if (!mode || !session.modeContent || !session.selectedVerse) {
    return null;
  }

  const selectedVerse = session.selectedVerse;
  const modeContent = session.modeContent;

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Scripture Reading" />
      <ExperienceSceneFrame
        experienceMode={experienceMode}
        floatingPrompts={[selectedVerse.reference, selectedVerse.theme]}
      >
        <View />
      </ExperienceSceneFrame>
      <FloatingScriptureCard intro={modeContent.scriptureIntro} verse={selectedVerse} />
      <View style={styles.actionStack}>
        <PrimaryButton label="Continue To Reflection" onPress={advanceToNextPhase} />
        <SecondaryButton
          label="Replay Narration"
          onPress={() => void replayNarration(`${selectedVerse.text}. ${selectedVerse.reference}.`)}
        />
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianReflectionScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/reflection' : '/christian/reflection',
  );
  useChristianExitGuard(
    experienceMode === 'fallback2d' ? '/christian-2d/reflection' : '/christian/reflection',
  );
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setCurrentPhase = useChristianSessionStore((state) => state.setCurrentPhase);
  const { advanceToNextPhase } = useChristianPhaseNavigation();
  const { playAmbient } = useChristianAudioService(session.audioSettings);

  useEffect(() => {
    setCurrentPhase('reflection');
    void playAmbient();
  }, [playAmbient, setCurrentPhase]);

  if (!mode || !session.modeContent) {
    return null;
  }

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Reflection" />
      <ExperienceSceneFrame experienceMode={experienceMode} floatingPrompts={['reflection']}>
        <View />
      </ExperienceSceneFrame>
      {session.audioSettings.reflectionPromptsEnabled ? (
        <ReflectionPromptCard prompt={session.modeContent.reflectionPrompt} />
      ) : null}
      <GlassCard>
        <ThemedText style={styles.sectionLabel}>Silent Timer</ThemedText>
        <View style={styles.chipRow}>
          {SILENT_TIMER_OPTIONS.map((option) => {
            const active = session.reflectionDraft.silentTimerMinutes === option;
            return (
              <Pressable
                key={String(option)}
                onPress={() => session.saveReflectionDraft({ silentTimerMinutes: option })}
                style={[styles.timerChip, active ? styles.timerChipActive : null]}
              >
                <ThemedText
                  style={[styles.timerChipText, active ? styles.timerChipTextActive : null]}
                >
                  {option === null ? 'Off' : `${option} min`}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>
      <ReflectionEditor
        onChangeTags={(tags) => session.saveReflectionDraft({ tags })}
        onChangeText={(text) => session.saveReflectionDraft({ text })}
        options={REFLECTION_TAG_OPTIONS}
        tags={session.reflectionDraft.tags}
        text={session.reflectionDraft.text}
      />
      <PrimaryButton
        label="Continue To Guided Prayer"
        onPress={() => {
          if (session.sessionId && session.mode) {
            void saveChristianReflectionDraft(
              session.sessionId,
              session.mode,
              session.reflectionDraft,
            );
          }
          advanceToNextPhase();
        }}
      />
    </ChristianFlowScreen>
  );
}

export function ChristianPrayerPhasesScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/prayer' : '/christian/prayer',
  );
  useChristianExitGuard(
    experienceMode === 'fallback2d' ? '/christian-2d/prayer' : '/christian/prayer',
  );
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const { advanceToNextPhase, goToPhase } = useChristianPhaseNavigation();
  const { playAmbient } = useChristianAudioService(session.audioSettings);

  useEffect(() => {
    if (!isGuidedPrayerPhase(session.currentPhase)) {
      goToPhase('praise');
      return;
    }

    void playAmbient();
  }, [goToPhase, playAmbient, session.currentPhase]);

  if (!mode || !session.modeContent || !isGuidedPrayerPhase(session.currentPhase)) {
    return null;
  }

  const currentPhase = session.currentPhase;
  const modeContent = session.modeContent;

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Guided Prayer" />
      <ExperienceSceneFrame experienceMode={experienceMode} floatingPrompts={[currentPhase]}>
        <View />
      </ExperienceSceneFrame>
      <PrayerStepper currentPhase={currentPhase} phases={CHRISTIAN_GUIDED_PRAYER_PHASES} />
      <PrayerPhaseCard phase={currentPhase} prompt={modeContent.prayerPrompts[currentPhase]} />
      <View style={styles.actionStack}>
        <PrimaryButton
          label={currentPhase === 'surrender' ? 'Enter Blessing' : 'Continue'}
          onPress={advanceToNextPhase}
        />
        {currentPhase !== 'praise' ? (
          <SecondaryButton
            label="Previous Movement"
            onPress={() => {
              const currentIndex = CHRISTIAN_GUIDED_PRAYER_PHASES.indexOf(currentPhase);
              if (currentIndex > 0) {
                goToPhase(CHRISTIAN_GUIDED_PRAYER_PHASES[currentIndex - 1]);
              }
            }}
          />
        ) : null}
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianBlessingScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/blessing' : '/christian/blessing',
  );
  useChristianExitGuard(
    experienceMode === 'fallback2d' ? '/christian-2d/blessing' : '/christian/blessing',
  );
  const router = useRouter();
  const mode = useChristianModeGuard();
  const session = useChristianPrayerSession();
  const setCurrentPhase = useChristianSessionStore((state) => state.setCurrentPhase);
  const { playAmbient } = useChristianAudioService(session.audioSettings);

  useEffect(() => {
    setCurrentPhase('blessing');
    void playAmbient();
  }, [playAmbient, setCurrentPhase]);

  if (!mode || !session.modeContent || !session.selectedVerse || !session.sessionId) {
    return null;
  }

  const modeContent = session.modeContent;
  const selectedVerse = session.selectedVerse;
  const sessionId = session.sessionId;

  const finishSession = async () => {
    const startedAtMs = session.sessionStartedAtMs ?? Date.now();
    const completedAtMs = Date.now();
    const summary = buildChristianSessionSummary({
      sessionId,
      mode,
      title: modeContent.title,
      verse: selectedVerse,
      durationMinutes: session.durationMinutes,
      startedAtMs,
      completedAtMs,
      reflectionPreview: session.reflectionDraft.text.trim() || null,
    });

    session.completeSession(summary);
    const persistenceResults = await Promise.allSettled([
      saveCompletedChristianSession(summary),
      clearChristianReflectionDraft(sessionId),
      trackChristianAnalyticsEvent({
        type: 'session_completed',
        sessionId,
        mode: session.mode,
        phase: 'complete',
      }),
    ]);
    const failedEffects = persistenceResults.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (failedEffects.length > 0) {
      console.warn(
        'Failed to finalize some Christian session side effects.',
        failedEffects.map(({ reason }) => reason),
      );
    }

    try {
      await triggerChristianCompletionHaptic(session.audioSettings.hapticsEnabled);
    } catch (error) {
      console.warn('Failed to trigger Christian completion haptic.', error);
    }

    router.replace(
      (experienceMode === 'fallback2d' ? '/christian-2d/complete' : '/christian/complete') as never,
    );
  };

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Blessing" />
      <ExperienceSceneFrame experienceMode={experienceMode} floatingPrompts={['peace', 'blessing']}>
        <View />
      </ExperienceSceneFrame>
      <BlessingCard text={modeContent.blessing} />
      <PrimaryButton label="Complete Session" onPress={() => void finishSession()} />
    </ChristianFlowScreen>
  );
}

export function ChristianCompleteScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/complete' : '/christian/complete',
  );
  const router = useRouter();
  const session = useChristianPrayerSession();

  if (!session.completionSummary) {
    return null;
  }

  const completionSummary = session.completionSummary;

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Completion" />
      <CompletionSummaryCard summary={completionSummary} />
      <View style={styles.actionStack}>
        <PrimaryButton
          label="Save Verse"
          onPress={() =>
            void saveFavoriteChristianVerse({
              savedAtMs: Date.now(),
              verse: completionSummary.verse,
            })
          }
        />
        <SecondaryButton
          label="Save Reflection"
          onPress={() => {
            if (session.sessionId && session.mode) {
              void saveChristianReflectionDraft(
                session.sessionId,
                session.mode,
                session.reflectionDraft,
              );
            }
          }}
        />
        <SecondaryButton
          label="Open Journal"
          onPress={() =>
            router.push(
              (experienceMode === 'fallback2d'
                ? '/christian-2d/journal'
                : '/christian/journal') as never,
            )
          }
        />
        <SecondaryButton
          label="Pray Again"
          onPress={() => {
            session.createDraftSession(session.mode ?? 'dailyScripture');
            router.replace('/christian/setup' as never);
          }}
        />
        <SecondaryButton
          label="Return Home"
          onPress={() => router.replace('/christian' as never)}
        />
      </View>
    </ChristianFlowScreen>
  );
}

export function ChristianJournalScreen({
  experienceMode,
}: {
  experienceMode: ChristianExperienceMode;
}) {
  useChristianRouteSync(
    experienceMode === 'fallback2d' ? '/christian-2d/journal' : '/christian/journal',
  );
  const router = useRouter();
  const session = useChristianPrayerSession();

  if (!session.modeContent) {
    return null;
  }

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Journal" onBack={() => router.back()} />
      <FloatingConfirmationCard title="Final Reflection" body={session.modeContent.journalPrompt} />
      <ReflectionEditor
        onChangeTags={(tags) => session.saveReflectionDraft({ tags })}
        onChangeText={(text) => session.saveReflectionDraft({ text })}
        options={REFLECTION_TAG_OPTIONS}
        tags={session.reflectionDraft.tags}
        text={session.reflectionDraft.text}
      />
      <PrimaryButton
        label="Save Journal"
        onPress={() => {
          if (session.sessionId && session.mode) {
            void saveChristianReflectionDraft(
              session.sessionId,
              session.mode,
              session.reflectionDraft,
            );
          }
          void trackChristianAnalyticsEvent({
            type: 'journal_saved',
            sessionId: session.sessionId,
            mode: session.mode,
            phase: session.currentPhase,
          });
          router.replace('/christian' as never);
        }}
      />
    </ChristianFlowScreen>
  );
}

export function ChristianExitConfirmScreen({ returnTo }: { returnTo?: string }) {
  useChristianRouteSync('/christian/exit-confirm');
  const router = useRouter();
  const session = useChristianPrayerSession();

  return (
    <ChristianFlowScreen>
      <TopOverlayHeader title="Leave Session?" />
      <FloatingConfirmationCard
        title="Your prayer will stay saved."
        body="You can resume from the same point later, or return home and begin again when you’re ready."
      />
      <View style={styles.actionStack}>
        <PrimaryButton
          label="Resume Prayer"
          onPress={() => {
            if (returnTo) {
              router.replace(returnTo as never);
              return;
            }
            router.back();
          }}
        />
        <SecondaryButton
          label="Leave For Now"
          onPress={() => {
            session.abandonSession();
            void trackChristianAnalyticsEvent({
              type: 'session_abandoned',
              sessionId: session.sessionId,
              mode: session.mode,
              phase: session.currentPhase,
              payload: {
                returnTo: returnTo ?? '',
              },
            });
            router.replace('/christian' as never);
          }}
        />
      </View>
    </ChristianFlowScreen>
  );
}

export function useLegacyChristianMode(templateId?: string | null) {
  return useMemo(() => resolveChristianModeFromLegacyTemplate(templateId), [templateId]);
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    gap: ChristianPrayerSpacing.md,
  },
  experienceContent: {
    flex: 1,
    gap: ChristianPrayerSpacing.md,
    justifyContent: 'center',
  },
  sectionBlock: {
    gap: 6,
  },
  sectionLabel: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  sectionBody: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  actionStack: {
    gap: ChristianPrayerSpacing.sm,
  },
  toggleCard: {
    gap: ChristianPrayerSpacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ChristianPrayerSpacing.sm,
  },
  timerChip: {
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
  },
  timerChipActive: {
    backgroundColor: ChristianPrayerPalette.goldSoft,
    borderColor: ChristianPrayerPalette.borderStrong,
  },
  timerChipText: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  timerChipTextActive: {
    color: ChristianPrayerPalette.ivory,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ChristianPrayerSpacing.sm,
  },
});
