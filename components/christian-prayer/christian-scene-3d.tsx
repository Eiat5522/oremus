import React, { lazy, Suspense } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Scene3DPlaceholder } from './scene-3d-placeholder';

// Lazy-load the Three.js scene to avoid issues on web/test environments
const ChristianScene3DScene = lazy(() =>
  import('./christian-scene-3d-scene').then((mod) => ({
    default: mod.ChristianScene3DScene,
  }))
);

interface ChristianScene3DProps {
  isReady?: boolean;
}

export function ChristianScene3D({ isReady = true }: ChristianScene3DProps) {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const isWeb = Platform.OS === 'web';

  if (isTestEnv || isWeb || !isReady) {
    return (
      <View style={styles.container}>
        <Scene3DPlaceholder label="Christian Prayer Scene" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={<Scene3DPlaceholder label="Loading scene..." />}>
        <ChristianScene3DScene />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
