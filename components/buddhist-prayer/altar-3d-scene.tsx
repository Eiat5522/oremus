/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { Group, Mesh, Object3D } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { BuddhistPrayerColors } from '@/constants/buddhist-prayer/theme';
import type { AltarProps } from '@/constants/buddhist-prayer/types';
import { useDeferredNativeMount } from '@/hooks/use-deferred-native-mount';
import { createNativeCanvasRenderer, ensureNativeThreeEnvironment } from '@/lib/three-native';

ensureNativeThreeEnvironment();

type AltarScene3DProps = Required<
  Pick<
    AltarProps,
    'scale' | 'rotation' | 'showHalo' | 'showIncenseSmoke' | 'glowIntensity' | 'animated'
  >
> & {
  onReady?: () => void;
};

type AltarAssetKey = 'buddha' | 'candle' | 'incense' | 'pedestal';
type LoadedAltarAssets = Record<AltarAssetKey, Object3D>;
type ModelPreparationOptions = {
  brightnessBoost?: number;
  emissiveColor?: string;
  emissiveIntensity?: number;
};

const CAMERA_POSITION = [0, 1.35, 5.8] as const;
const FLOOR_ROTATION_X = -Math.PI / 2;
const ALTAR_MODEL_MODULES: Record<AltarAssetKey, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  buddha: require('@/assets/models/buddhist/buddha-wood.glb') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  candle: require('@/assets/models/buddhist/candle-holder.glb') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  incense: require('@/assets/models/buddhist/incense.glb') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pedestal: require('@/assets/models/buddhist/pedestal-base.glb') as number,
};

function normalizeGltfScene(input: unknown): Object3D | null {
  if (!input || typeof input !== 'object') return null;
  if ('scene' in input && input.scene instanceof THREE.Object3D) return input.scene;
  if (input instanceof THREE.Object3D) return input;
  return null;
}

async function loadAltarAsset(modelModule: number) {
  const asset = Asset.fromModule(modelModule);
  const uri = asset.localUri ?? asset.uri;

  if (!uri) {
    throw new Error('No URI for Buddhist altar model');
  }

  const gltf = await new GLTFLoader().loadAsync(uri);
  const scene = normalizeGltfScene(gltf);

  if (!scene) {
    throw new Error('Unable to load Buddhist altar model');
  }

  return scene;
}

function tuneMaterial(
  material: THREE.Material,
  { brightnessBoost = 1, emissiveColor, emissiveIntensity }: ModelPreparationOptions,
) {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return;
  }

  if (brightnessBoost !== 1) {
    material.color.multiplyScalar(brightnessBoost);
  }

  if (emissiveColor) {
    material.emissive.set(emissiveColor);
    // Default to 0.5 when emissiveColor is set but intensity is not specified,
    // ensuring the emissive glow is actually visible
    material.emissiveIntensity = emissiveIntensity ?? 0.5;
  }
}

function prepareModel(
  source: Object3D,
  targetHeight: number,
  options: ModelPreparationOptions = {},
) {
  const model = source.clone(true);

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => {
        const clonedMaterial = material.clone();
        tuneMaterial(clonedMaterial, options);
        return clonedMaterial;
      });
      return;
    }

    const clonedMaterial = child.material.clone();
    tuneMaterial(clonedMaterial, options);
    child.material = clonedMaterial;
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const height = Math.max(initialSize.y, 0.001);
  const scale = targetHeight / height;

  model.scale.multiplyScalar(scale);

  const normalizedBox = new THREE.Box3().setFromObject(model);
  const center = normalizedBox.getCenter(new THREE.Vector3());
  const min = normalizedBox.min.clone();

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= min.y;

  return model;
}

function IncenseSmoke({
  position,
  showIncenseSmoke,
  animated,
}: {
  position: [number, number, number];
  showIncenseSmoke: boolean;
  animated: boolean;
}) {
  const smokeRefs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    smokeRefs.current.forEach((mesh, index) => {
      if (!mesh) {
        return;
      }

      const elapsed = clock.getElapsedTime() + index * 0.4;
      const material = mesh.material;
      const yOffset = animated ? (elapsed % 3) * 0.15 : index * 0.12;

      mesh.position.x = position[0] + Math.sin(elapsed * 0.75) * 0.04;
      mesh.position.y = position[1] + index * 0.16 + yOffset;
      mesh.position.z = position[2] + Math.cos(elapsed * 0.5) * 0.03;

      const scale = animated ? 0.72 + index * 0.15 + (elapsed % 1.1) * 0.09 : 0.84 + index * 0.12;
      mesh.scale.setScalar(scale);

      if (material instanceof THREE.MeshStandardMaterial) {
        material.opacity = showIncenseSmoke ? Math.max(0.08, 0.22 - index * 0.04) : 0;
      }
    });
  });

  return (
    <>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[position[0], position[1] + index * 0.16, position[2]]}
          ref={(mesh) => {
            smokeRefs.current[index] = mesh;
          }}
        >
          <sphereGeometry args={[0.11 + index * 0.04, 18, 18]} />
          <meshStandardMaterial
            color="#EDE7DB"
            emissive="#F8E8CB"
            emissiveIntensity={0.12}
            opacity={showIncenseSmoke ? 0.18 : 0}
            roughness={1}
            transparent
          />
        </mesh>
      ))}
    </>
  );
}

function AltarSceneContent({
  scale,
  rotation,
  showHalo: _showHalo,
  showIncenseSmoke,
  glowIntensity,
  animated,
  onReady,
}: AltarScene3DProps) {
  const altarRef = useRef<Group>(null);
  const [assets, setAssets] = useState<LoadedAltarAssets | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const baseRotation = useMemo(() => THREE.MathUtils.degToRad(rotation), [rotation]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      const loadedEntries = await Promise.all(
        (Object.entries(ALTAR_MODEL_MODULES) as [AltarAssetKey, number][]).map(
          async ([key, module]) => [key, await loadAltarAsset(module)],
        ),
      );

      if (!cancelled) {
        setAssets(Object.fromEntries(loadedEntries) as LoadedAltarAssets);
      }
    }

    setAssets(null);
    setLoadError(null);

    loadAssets().catch((error: unknown) => {
      if (!cancelled) {
        setLoadError(
          error instanceof Error ? error : new Error('Failed to load Buddhist altar assets'),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const buddhaModel = useMemo(() => {
    if (!assets) {
      return null;
    }

    return prepareModel(assets.buddha, 2.2, {
      brightnessBoost: 1.18,
      emissiveColor: '#D4A74A',
      emissiveIntensity: 0.12,
    });
  }, [assets]);

  const leftCandleModel = useMemo(() => {
    if (!assets) {
      return null;
    }

    return prepareModel(assets.candle, 1.05);
  }, [assets]);

  const rightCandleModel = useMemo(() => {
    if (!assets) {
      return null;
    }

    return prepareModel(assets.candle, 1.05);
  }, [assets]);

  const incenseModel = useMemo(() => {
    if (!assets) {
      return null;
    }

    return prepareModel(assets.incense, 0.78);
  }, [assets]);

  const pedestalModel = useMemo(() => {
    if (!assets) {
      return null;
    }

    return prepareModel(assets.pedestal, 0.72);
  }, [assets]);

  useEffect(() => {
    if (assets) {
      onReady?.();
    }
  }, [assets, onReady]);

  useFrame(({ clock }) => {
    if (!altarRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const pulseScale = animated ? 1 + Math.sin(elapsed * 1.15) * 0.03 : 1;

    altarRef.current.scale.setScalar(scale * pulseScale);
    altarRef.current.rotation.y = baseRotation + (animated ? Math.sin(elapsed * 0.42) * 0.04 : 0);
    altarRef.current.position.y = animated ? Math.sin(elapsed * 0.7) * 0.03 : 0;
  });

  if (loadError) {
    throw loadError;
  }

  if (!buddhaModel || !leftCandleModel || !rightCandleModel || !incenseModel || !pedestalModel) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight color="#FFF4D7" intensity={1.65} position={[3.6, 4.8, 2.6]} />
      <pointLight
        color={BuddhistPrayerColors.goldPrimary}
        intensity={Math.max(0.9, glowIntensity * 1.4)}
        distance={7.2}
        position={[0, 2.2, 1.4]}
      />

      <mesh rotation={[FLOOR_ROTATION_X, 0, 0]} position={[0, -1.16, 0]}>
        <circleGeometry args={[3, 48]} />
        <meshStandardMaterial color="#26170F" roughness={0.97} />
      </mesh>

      <group ref={altarRef}>
        <group position={[0, -1.04, 0]}>
          <primitive object={pedestalModel} />
        </group>

        <group position={[0, -0.76, -0.02]}>
          <primitive object={buddhaModel} />
        </group>

        <group position={[-1.42, -0.68, 0.52]} rotation={[0, Math.PI / 10, 0]}>
          <primitive object={leftCandleModel} />
          <pointLight
            color="#FFCB6B"
            intensity={animated ? 0.9 : 0.7}
            distance={2.4}
            position={[0, 0.72, 0.1]}
          />
        </group>

        <group position={[1.42, -0.68, 0.52]} rotation={[0, -Math.PI / 10, 0]}>
          <primitive object={rightCandleModel} />
          <pointLight
            color="#FFCB6B"
            intensity={animated ? 0.9 : 0.7}
            distance={2.4}
            position={[0, 0.72, 0.1]}
          />
        </group>

        <group position={[0, -0.74, 1.02]}>
          <primitive object={incenseModel} />
          <IncenseSmoke
            animated={animated}
            position={[0, 0.34, 0]}
            showIncenseSmoke={showIncenseSmoke}
          />
        </group>
      </group>
    </>
  );
}

export const AltarScene3D = memo(function AltarScene3D(props: AltarScene3DProps) {
  const canMountCanvas = useDeferredNativeMount();

  if (!canMountCanvas) {
    return null;
  }

  return (
    <Canvas
      camera={{ fov: 34, position: CAMERA_POSITION }}
      gl={createNativeCanvasRenderer}
      style={styles.canvas}
    >
      <AltarSceneContent {...props} />
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
