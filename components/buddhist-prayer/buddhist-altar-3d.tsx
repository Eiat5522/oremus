import React, { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { AltarProps } from '@/constants/buddhist-prayer/types';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import { Altar3DPlaceholder } from './altar-3d-placeholder';

type AltarScene3DModule = typeof import('./altar-3d-scene');
type AltarScene3DProps = React.ComponentProps<AltarScene3DModule['AltarScene3D']>;
type AltarSceneLoader = () => Promise<AltarScene3DModule>;

const defaultAltarSceneLoader: AltarSceneLoader = () => import('./altar-3d-scene');

let altarSceneLoader: AltarSceneLoader = defaultAltarSceneLoader;

interface BuddhistAltar3DProps extends AltarProps {
  style?: ViewStyle;
}

interface SceneBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = {
    hasError: false,
  };

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

export function __setAltarSceneLoaderForTests(loader: AltarSceneLoader | null) {
  altarSceneLoader = loader ?? defaultAltarSceneLoader;
}

export function BuddhistAltar3D({
  scale = 1,
  rotation = 0,
  showHalo = true,
  showIncenseSmoke = true,
  glowIntensity = 1,
  animated,
  style,
}: BuddhistAltar3DProps) {
  const prefersReducedMotion = useReducedMotion();
  const [SceneComponent, setSceneComponent] = useState<ComponentType<AltarScene3DProps> | null>(
    null,
  );
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [hasSceneError, setHasSceneError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setIsSceneReady(false);
    setHasSceneError(false);

    altarSceneLoader()
      .then((module) => {
        if (!isMounted) {
          return;
        }

        setSceneComponent(() => module.AltarScene3D);
      })
      .catch(() => {
        if (isMounted) {
          setHasSceneError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedAnimated = animated ?? !prefersReducedMotion;
  const shouldShowFallback = hasSceneError || !isSceneReady;

  return (
    <View style={[styles.container, style]}>
      {shouldShowFallback ? (
        <Altar3DPlaceholder
          animated={resolvedAnimated}
          showHalo={showHalo}
          showIncenseSmoke={showIncenseSmoke}
          style={styles.layer}
        />
      ) : null}

      {SceneComponent && !hasSceneError ? (
        <View
          pointerEvents="none"
          style={[styles.layer, isSceneReady ? styles.sceneVisible : styles.sceneHidden]}
        >
          <SceneErrorBoundary onError={() => setHasSceneError(true)}>
            <SceneComponent
              animated={resolvedAnimated}
              glowIntensity={glowIntensity}
              onReady={() => setIsSceneReady(true)}
              rotation={rotation}
              scale={scale}
              showHalo={showHalo}
              showIncenseSmoke={showIncenseSmoke}
            />
          </SceneErrorBoundary>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneHidden: {
    opacity: 0,
  },
  sceneVisible: {
    opacity: 1,
  },
});
