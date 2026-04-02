import React from 'react';
import { render } from '@testing-library/react-native';

import { ChristianArViewport } from '@/features/christian-prayer/components/scenes/christian-ar-viewport';
import type { ArPlacementState } from '@/features/christian-prayer/constants';

const mockPrayerCornerScene = jest.fn(
  ({
    centerpiece,
    children,
  }: {
    centerpiece?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <MockSceneShell>
      {centerpiece ? <MockSceneCenterpiece>{centerpiece}</MockSceneCenterpiece> : null}
      {children}
    </MockSceneShell>
  ),
);

const mockTrackChristianAnalyticsEvent = jest.fn();

const mockReadyModelState = {
  manifest: null,
  assets: [
    { id: 'jesus_statue_a', status: 'ready', moduleId: 1 },
    { id: 'cross_wood_a', status: 'ready', moduleId: 2 },
    { id: 'bible_open_a', status: 'ready', moduleId: 3 },
    { id: 'candle_tall_a', status: 'ready', moduleId: 4 },
    { id: 'candle_short_a', status: 'ready', moduleId: 5 },
    { id: 'prayer_table_wood_a', status: 'ready', moduleId: 6 },
  ],
  readyAssetCount: 6,
  missingAssetIds: [],
  failedAssetIds: [],
  coreReady: true,
  isLoading: false,
  error: null,
};

const mockSessionState = {
  sessionId: 'session-1',
  mode: 'peace',
  currentPhase: 'idle',
};

function MockSceneShell({ children }: { children?: React.ReactNode }) {
  const { View } = require('react-native');
  return <View testID="prayer-corner-scene">{children}</View>;
}

function MockSceneCenterpiece({ children }: { children?: React.ReactNode }) {
  const { View } = require('react-native');
  return <View testID="scene-centerpiece">{children}</View>;
}

jest.mock('expo-camera', () => ({
  CameraView: () => null,
}));
jest.mock('@/features/christian-prayer/hooks/useChristianPrayerCornerModels', () => ({
  useChristianPrayerCornerModels: () => mockReadyModelState,
}));
jest.mock('@/features/christian-prayer/components/scenes/prayer-corner-3d-stage', () => ({
  PrayerCorner3DStage: () => {
    const { View } = require('react-native');
    return <View testID="prayer-corner-3d-stage" />;
  },
}));
jest.mock('@/features/christian-prayer/components/scenes/prayer-corner-scene', () => ({
  PrayerCornerScene: (props: {
    centerpiece?: React.ReactNode;
    children?: React.ReactNode;
  }) => mockPrayerCornerScene(props),
}));
jest.mock('@/features/christian-prayer/services/christianAnalytics.service', () => ({
  trackChristianAnalyticsEvent: (...args: unknown[]) => mockTrackChristianAnalyticsEvent(...args),
}));
jest.mock('@/features/christian-prayer/store/useChristianSessionStore', () => ({
  useChristianSessionStore: (selector: (state: typeof mockSessionState) => unknown) =>
    selector(mockSessionState),
}));

describe('ChristianArViewport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mounts the live 3D prayer corner as the scene centerpiece when assets are ready', () => {
    const placementState: ArPlacementState = {
      status: 'surfaceDetected',
      canPlace: true,
      isPlaced: false,
      trackingQuality: 'good',
      transform: {
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        z: 0,
      },
      guidance: 'Surface found.',
      retryCount: 0,
      updatedAtMs: Date.now(),
      errorCode: null,
    };

    render(
      <ChristianArViewport
        cameraGranted
        floatingPrompts={['cross']}
        placementState={placementState}
        sceneStyle={{
          haloIntensity: 0.5,
          candleIntensity: 0.5,
          particleRate: 0.5,
          ambientTone: 'warm',
        }}
      />,
    );

    expect(mockPrayerCornerScene).toHaveBeenCalled();
    expect(mockPrayerCornerScene.mock.calls[0]?.[0]?.centerpiece).toBeTruthy();
  });
});
