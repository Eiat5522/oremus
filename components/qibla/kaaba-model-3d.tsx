import React, { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

// Bundled Kaaba GLB — resolved at build time by Metro
// eslint-disable-next-line @typescript-eslint/no-require-imports
const KAABA_MODEL_MODULE = require('@/assets/models/islamic/kaaba.glb') as number;

type KaabaSceneModule = typeof import('./kaaba-scene-3d');
type KaabaSceneLoader = () => Promise<KaabaSceneModule>;

const defaultLoader: KaabaSceneLoader = () => import('./kaaba-scene-3d');
let sceneLoader: KaabaSceneLoader = defaultLoader;

/** Override the scene loader in tests to prevent Three.js/GL imports. */
export function __setKaabaSceneLoaderForTests(loader: KaabaSceneLoader | null) {
  sceneLoader = loader ?? defaultLoader;
}

interface SceneBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface KaabaModel3DProps {
  /** Fallback icon color (used on web / error). */
  fallbackColor?: string;
  /** Fallback icon size (used on web / error). */
  fallbackSize?: number;
  onReady?: () => void;
}

export function KaabaModel3D({
  fallbackColor = '#161616',
  fallbackSize = 28,
  onReady,
}: KaabaModel3DProps) {
  const [SceneComponent, setSceneComponent] = useState<ComponentType<{
    modelModule: number;
    onReady?: () => void;
  }> | null>(null);
  const [hasError, setHasError] = useState(false);

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isWeb) return;

    let mounted = true;

    sceneLoader()
      .then((module) => {
        if (mounted) setSceneComponent(() => module.KaabaScene3D);
      })
      .catch(() => {
        if (mounted) setHasError(true);
      });

    return () => {
      mounted = false;
    };
  }, [isWeb]);

  if (isWeb || hasError || !SceneComponent) {
    return <IconSymbol color={fallbackColor} name="kaaba" size={fallbackSize} />;
  }

  return (
    <SceneErrorBoundary onError={() => setHasError(true)}>
      <SceneComponent modelModule={KAABA_MODEL_MODULE} onReady={onReady} />
    </SceneErrorBoundary>
  );
}
