import { CameraView } from 'expo-camera';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const slotMissingTrackedRef = useRef(false);
  const stageActivatedTrackedRef = useRef(false);
  const modelState = useChristianPrayerCornerModels();
  const sessionId = useChristianSessionStore((state) => state.sessionId);
  const mode = useChristianSessionStore((state) => state.mode);
  const currentPhase = useChristianSessionStore((state) => state.currentPhase);
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
    crossModelModule !== null &&
    bibleModelModule !== null &&
    prayerTableModelModule !== null;

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

  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      ) : (
        <View style={styles.cameraFallback} />
      )}

      <View style={styles.mask} />
      <PrayerCornerScene
        centerpiece={
          canUse3dStage ? (
            <PrayerCorner3DStage
              bibleModelModule={bibleModelModule}
              candleShortModelModule={candleShortModelModule}
              candleTallModelModule={candleTallModelModule}
              crossModelModule={crossModelModule}
              prayerTableModelModule={prayerTableModelModule}
              onError={() => {
                setHas3dRenderError(true);
                void trackChristianAnalyticsEvent({
                  type: 'model_preload_failed',
                  sessionId,
                  mode,
                  phase: currentPhase,
                  payload: { errorCode: 'modelLoadFailed' },
                });
              }}
              onStageActivated={() => {
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
              }}
              sceneStyle={sceneStyle}
            />
          ) : null
        }
        floatingPrompts={floatingPrompts}
        sceneStyle={sceneStyle}
      >
        <View style={styles.guidanceWrap}>
          <View style={styles.guidanceCard}>
            <ThemedText style={styles.status}>{placementState.status}</ThemedText>
            <ThemedText style={styles.guidance}>{placementState.guidance}</ThemedText>
          </View>
        </View>
      </PrayerCornerScene>

      {__DEV__ ? (
        <View style={styles.assetStatusWrap}>
          <ThemedText style={styles.assetStatusText}>
            {modelState.isLoading
              ? '3D assets: checking manifest'
              : modelState.error
                ? `3D assets: ${modelState.error}`
                : `3D assets: ${modelState.readyAssetCount}/${modelState.assets.length} ready${canUse3dStage ? ' (3D active)' : ' (fallback)'}`}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
