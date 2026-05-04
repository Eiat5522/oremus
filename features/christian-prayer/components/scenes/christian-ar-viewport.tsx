import { CameraView } from 'expo-camera';
import React, { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrayerCorner3DStage } from '@/features/christian-prayer/components/scenes/prayer-corner-3d-stage';
import { PrayerCornerScene } from '@/features/christian-prayer/components/scenes/prayer-corner-scene';
import {
  ChristianPrayerPalette,
  type ArPlacementState,
  type ChristianArSceneStyle,
} from '@/features/christian-prayer/constants';
import { useChristianPrayerCornerModels } from '@/features/christian-prayer/hooks/useChristianPrayerCornerModels';
import { trackChristianAnalyticsEvent } from '@/features/christian-prayer/services/christianAnalytics.service';
import { useChristianSessionStore } from '@/features/christian-prayer/store/useChristianSessionStore';

// ---------------------------------------------------------------------------
// Error boundary – catches Three.js / Canvas runtime errors so the viewport
// falls back to the 2D placeholder instead of crashing the whole screen.
// Follows the same pattern as the Buddhist SceneErrorBoundary.
// ---------------------------------------------------------------------------

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// ChristianArViewport
// ---------------------------------------------------------------------------

interface ChristianArViewportProps {
  placementState: ArPlacementState;
  sceneStyle: ChristianArSceneStyle;
  cameraGranted: boolean;
  floatingPrompts?: string[];
}

export function ChristianArViewport({
  placementState,
  sceneStyle,
  cameraGranted,
  floatingPrompts,
}: ChristianArViewportProps) {
  const [has3dRenderError, setHas3dRenderError] = useState(false);
  const [is3dStageActive, setIs3dStageActive] = useState(false);
  const slotMissingTrackedRef = useRef(false);
  const stageActivatedTrackedRef = useRef(false);
  const modelState = useChristianPrayerCornerModels();
  const sessionId = useChristianSessionStore((state) => state.sessionId);
  const mode = useChristianSessionStore((state) => state.mode);
  const currentPhase = useChristianSessionStore((state) => state.currentPhase);
  const jesusStatueModel = useMemo(
    () =>
      modelState.assets.find(
        (asset) => asset.id === 'jesus_statue_a' && asset.status === 'ready' && asset.moduleId,
      ) ?? null,
    [modelState.assets],
  );
  const crossModel = useMemo(
    () =>
      modelState.assets.find(
        (asset) => asset.id === 'cross_wood_a' && asset.status === 'ready' && asset.moduleId,
      ) ?? null,
    [modelState.assets],
  );
  const bibleModel = useMemo(
    () =>
      modelState.assets.find(
        (asset) => asset.id === 'bible_open_a' && asset.status === 'ready' && asset.moduleId,
      ) ?? null,
    [modelState.assets],
  );
  const jesusStatueModelModule = jesusStatueModel?.moduleId ?? null;
  const crossModelModule = crossModel?.moduleId ?? null;
  const bibleModelModule = bibleModel?.moduleId ?? null;
  const candleTallModelModule =
    modelState.assets.find((asset) => asset.id === 'candle_tall_a' && asset.status === 'ready')
      ?.moduleId ?? null;
  const candleShortModelModule =
    modelState.assets.find((asset) => asset.id === 'candle_short_a' && asset.status === 'ready')
      ?.moduleId ?? null;
  const prayerTableModelModule =
    modelState.assets.find(
      (asset) => asset.id === 'prayer_table_wood_a' && asset.status === 'ready',
    )?.moduleId ?? null;
  const canUse3dStage =
    !has3dRenderError &&
    modelState.coreReady &&
    jesusStatueModelModule !== null &&
    crossModelModule !== null &&
    bibleModelModule !== null &&
    prayerTableModelModule !== null;

  useEffect(() => {
    setIs3dStageActive(false);
    stageActivatedTrackedRef.current = false;
  }, [
    bibleModelModule,
    candleShortModelModule,
    candleTallModelModule,
    crossModelModule,
    has3dRenderError,
    jesusStatueModelModule,
    prayerTableModelModule,
  ]);

  useEffect(() => {
    if (slotMissingTrackedRef.current || modelState.isLoading) {
      return;
    }

    const missingOrFailedIds = [...modelState.missingAssetIds, ...modelState.failedAssetIds];
    if (missingOrFailedIds.length === 0) {
      return;
    }

    slotMissingTrackedRef.current = true;
    missingOrFailedIds.forEach((assetId) => {
      void trackChristianAnalyticsEvent({
        type: 'model_slot_missing',
        sessionId,
        mode,
        phase: currentPhase,
        payload: { assetId },
      });
    });
  }, [
    currentPhase,
    modelState.failedAssetIds,
    modelState.isLoading,
    modelState.missingAssetIds,
    mode,
    sessionId,
  ]);

  // -----------------------------------------------------------------------
  // Buddhist-style layered rendering:
  //   Layer 0 – Camera (or dark fallback)
  //   Layer 1 – Semi-transparent mask
  //   Layer 2 – PrayerCornerScene with 2D fallback silhouettes (placeholder)
  //             Visible while 3D stage is NOT active.
  //   Layer 3 – PrayerCorner3DStage (real 3D models)
  //             Starts at opacity 0; flips to opacity 1 when onStageActivated
  //             fires, meaning all GLTF models are loaded and the first frame
  //             has rendered. Wrapped in SceneErrorBoundary so a Three.js
  //             crash falls back to the 2D placeholder permanently.
  //   Layer 4 – Guidance card overlay
  //   Layer 5 – Dev asset status badge
  // -----------------------------------------------------------------------

  const shouldShowPlaceholder = has3dRenderError || !is3dStageActive;

  const handleStageError = () => {
    setHas3dRenderError(true);
    setIs3dStageActive(false);
    void trackChristianAnalyticsEvent({
      type: 'model_preload_failed',
      sessionId,
      mode,
      phase: currentPhase,
      payload: { errorCode: 'modelLoadFailed' },
    });
  };

  const handleStageActivated = () => {
    setIs3dStageActive(true);
    if (stageActivatedTrackedRef.current) {
      return;
    }

    stageActivatedTrackedRef.current = true;
    void trackChristianAnalyticsEvent({
      type: '3d_stage_activated',
      sessionId,
      mode,
      phase: currentPhase,
    });
  };

  const livePrayerCornerCenterpiece = canUse3dStage ? (
    <PrayerCorner3DStage
      bibleModelModule={bibleModelModule}
      candleShortModelModule={candleShortModelModule}
      candleTallModelModule={candleTallModelModule}
      crossModelModule={crossModelModule}
      jesusStatueModelModule={jesusStatueModelModule}
      prayerTableModelModule={prayerTableModelModule}
      onError={handleStageError}
      onStageActivated={handleStageActivated}
      sceneStyle={sceneStyle}
    />
  ) : null;

  return (
    <View style={styles.container}>
      {/* Layer 0 – Camera background */}
      {cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      ) : (
        <View style={styles.cameraFallback} />
      )}

      {/* Layer 1 – Mask overlay */}
      <View style={styles.mask} />

      {/* Layer 2 – 2D placeholder (PrayerCornerScene with fallback silhouettes) */}
      {shouldShowPlaceholder ? (
        <View style={styles.sceneLayer}>
          <PrayerCornerScene
            centerpiece={livePrayerCornerCenterpiece}
            floatingPrompts={floatingPrompts}
            sceneStyle={sceneStyle}
          />
        </View>
      ) : null}

      {/* Layer 3 – 3D stage (real GLTF models inside Canvas) */}
      {canUse3dStage ? (
        <View
          pointerEvents="none"
          style={[styles.sceneLayer, is3dStageActive ? styles.sceneVisible : styles.sceneHidden]}
        >
          <SceneErrorBoundary onError={handleStageError}>
            {livePrayerCornerCenterpiece}
          </SceneErrorBoundary>
        </View>
      ) : null}

      {/* Layer 4 – Guidance card */}
      <View style={styles.guidanceWrap}>
        <View style={styles.guidanceCard}>
          <ThemedText style={styles.status}>{placementState.status}</ThemedText>
          <ThemedText style={styles.guidance}>{placementState.guidance}</ThemedText>
        </View>
      </View>

      {/* Layer 5 – Dev asset status badge */}
      {__DEV__ ? (
        <View style={styles.assetStatusWrap}>
          <ThemedText style={styles.assetStatusText}>
            {modelState.isLoading
              ? '3D assets: checking manifest'
              : modelState.error
                ? `3D assets: ${modelState.error}`
                : `3D assets: ${modelState.readyAssetCount}/${modelState.assets.length} ready${is3dStageActive ? ' (3D active)' : canUse3dStage ? ' (warming up)' : ' (fallback)'}`}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 360,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#090605',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#251B17',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ChristianPrayerPalette.cameraMask,
  },
  sceneLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneHidden: {
    opacity: 0,
  },
  sceneVisible: {
    opacity: 1,
  },
  guidanceWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  guidanceCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(20, 14, 12, 0.88)',
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    gap: 4,
  },
  status: {
    color: ChristianPrayerPalette.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  guidance: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  assetStatusWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(18, 12, 10, 0.84)',
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
  },
  assetStatusText: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
});
