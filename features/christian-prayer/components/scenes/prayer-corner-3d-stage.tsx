/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Group, Material, Mesh, Object3D } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS,
  type ChristianArSceneStyle,
} from '@/features/christian-prayer/constants';
import { resolveChristianCandleEmissiveIntensity } from '@/features/christian-prayer/utils/candle-emissive';
import { useDeferredNativeMount } from '@/hooks/use-deferred-native-mount';
import { createNativeCanvasRenderer, ensureNativeThreeEnvironment } from '@/lib/three-native';

ensureNativeThreeEnvironment();

const MODEL_RETRY_COUNT = 1;

interface ModelSet {
  prayerTable: Object3D;
  cross: Object3D;
  bible: Object3D;
  candleTall: Object3D | null;
  candleShort: Object3D | null;
}

interface PrayerCorner3DStageProps {
  sceneStyle: ChristianArSceneStyle;
  prayerTableModelModule: number;
  crossModelModule: number;
  bibleModelModule: number;
  candleTallModelModule?: number | null;
  candleShortModelModule?: number | null;
  onError: (errorCode: 'modelLoadFailed') => void;
  onStageActivated?: () => void;
}

function normalizeLoadedObject(input: unknown): Object3D | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  if ('scene' in input && input.scene instanceof THREE.Object3D) {
    return input.scene;
  }

  if (input instanceof THREE.Object3D) {
    return input;
  }

  return null;
}

function toMaterialArray(material: Material | Material[]): Material[] {
  return Array.isArray(material) ? material : [material];
}

function applyCandleEmissive(object: Object3D, intensity: number) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const material = child.material;
    if (!material) {
      return;
    }

    const materials = toMaterialArray(material);
    materials.forEach((entry) => {
      if (
        entry instanceof THREE.MeshStandardMaterial ||
        entry instanceof THREE.MeshPhysicalMaterial
      ) {
        if (entry.emissive.equals(new THREE.Color(0x000000))) {
          entry.emissive = new THREE.Color(0xffcc88);
        }
        entry.emissiveIntensity = intensity;
        entry.needsUpdate = true;
      }
    });
  });
}

function disposeObject3D(object: Object3D | null) {
  if (!object) {
    return;
  }

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry?.dispose();
    const materials = toMaterialArray(child.material);
    materials.forEach((material) => {
      const map = (material as Material & { map?: THREE.Texture | null }).map;
      map?.dispose();
      material.dispose();
    });
  });
}

async function loadModel(moduleId: number): Promise<Object3D> {
  let attempts = 0;

  while (attempts <= MODEL_RETRY_COUNT) {
    attempts += 1;
    try {
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();

      const uri = asset.localUri ?? asset.uri;
      if (!uri) {
        throw new Error('Loaded model does not expose a valid URI');
      }

      const loaded = await new GLTFLoader().loadAsync(uri);
      const model = normalizeLoadedObject(loaded);
      if (!model) {
        throw new Error('Loaded model does not expose a valid Object3D');
      }
      return model;
    } catch (error) {
      if (attempts > MODEL_RETRY_COUNT) {
        throw error;
      }
    }
  }

  throw new Error('Unable to load model');
}

async function loadOptionalModel(moduleId: number | null | undefined): Promise<Object3D | null> {
  if (!moduleId) {
    return null;
  }

  try {
    return await loadModel(moduleId);
  } catch {
    return null;
  }
}

function ProceduralCandle({
  position,
  emissiveIntensity,
}: {
  position: [number, number, number];
  emissiveIntensity: number;
}) {
  const flameRef = useRef<Mesh>(null);

  useFrame(() => {
    const material = flameRef.current?.material;
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissiveIntensity = emissiveIntensity;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.52, 18]} />
        <meshStandardMaterial color="#F6E8CA" roughness={0.62} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.52, 0]}>
        <coneGeometry args={[0.055, 0.16, 18]} />
        <meshStandardMaterial
          color="#FFC479"
          emissive="#FFAB56"
          emissiveIntensity={emissiveIntensity}
          roughness={0.24}
          metalness={0}
        />
      </mesh>
      <pointLight
        color="#FFD8A0"
        intensity={Math.max(0.3, emissiveIntensity * 0.34)}
        distance={2.4}
        position={[0, 0.5, 0.1]}
      />
    </group>
  );
}

function PrayerCorner3DSceneContent({
  sceneStyle,
  modelSet,
}: {
  sceneStyle: ChristianArSceneStyle;
  modelSet: ModelSet;
}) {
  const groupRef = useRef<Group>(null);
  const prayerTable = useMemo(() => modelSet.prayerTable.clone(true), [modelSet.prayerTable]);
  const cross = useMemo(() => modelSet.cross.clone(true), [modelSet.cross]);
  const bible = useMemo(() => modelSet.bible.clone(true), [modelSet.bible]);
  const candleTall = useMemo(() => modelSet.candleTall?.clone(true) ?? null, [modelSet.candleTall]);
  const candleShort = useMemo(
    () => modelSet.candleShort?.clone(true) ?? null,
    [modelSet.candleShort],
  );

  useEffect(() => {
    return () => {
      disposeObject3D(prayerTable);
      disposeObject3D(cross);
      disposeObject3D(bible);
      disposeObject3D(candleTall);
      disposeObject3D(candleShort);
    };
  }, [bible, candleShort, candleTall, cross, prayerTable]);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const candleEmissive = resolveChristianCandleEmissiveIntensity(sceneStyle, elapsed);
    groupRef.current.position.y = Math.sin(elapsed * 0.45) * 0.02;
    groupRef.current.rotation.y = Math.sin(elapsed * 0.25) * 0.04;

    if (candleTall) {
      applyCandleEmissive(candleTall, candleEmissive);
    }
    if (candleShort) {
      applyCandleEmissive(candleShort, candleEmissive);
    }
  });

  const candleEmissiveStatic = resolveChristianCandleEmissiveIntensity(sceneStyle, 0);

  return (
    <>
      <ambientLight intensity={0.62 + sceneStyle.haloIntensity * 0.22} />
      <directionalLight color="#FFE9C0" intensity={1.32} position={[3.2, 4.4, 2.4]} />
      <pointLight
        color="#FFD89A"
        intensity={0.5 + sceneStyle.candleIntensity * 0.7}
        distance={5.6}
        position={[0, 1.5, 1.1]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <circleGeometry args={[2.2, 42]} />
        <meshStandardMaterial color="#2B1D17" roughness={0.94} />
      </mesh>

      <group ref={groupRef} position={[0, -0.74, 0]}>
        <primitive
          object={prayerTable}
          {...CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.prayer_table_wood_a}
        />
        <primitive object={cross} {...CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.cross_wood_a} />
        <primitive object={bible} {...CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.bible_open_a} />

        {candleTall ? (
          <primitive
            object={candleTall}
            {...CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.candle_tall_a}
          />
        ) : (
          <ProceduralCandle
            emissiveIntensity={candleEmissiveStatic}
            position={CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.candle_tall_a.position}
          />
        )}

        {candleShort ? (
          <primitive
            object={candleShort}
            {...CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.candle_short_a}
          />
        ) : (
          <ProceduralCandle
            emissiveIntensity={candleEmissiveStatic}
            position={CHRISTIAN_PRAYER_CORNER_MODEL_TRANSFORMS.candle_short_a.position}
          />
        )}
      </group>
    </>
  );
}

export function PrayerCorner3DStage({
  sceneStyle,
  prayerTableModelModule,
  crossModelModule,
  bibleModelModule,
  candleTallModelModule,
  candleShortModelModule,
  onError,
  onStageActivated,
}: PrayerCorner3DStageProps) {
  const [modelSet, setModelSet] = useState<ModelSet | null>(null);
  const canMountCanvas = useDeferredNativeMount();

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const [prayerTable, cross, bible, candleTall, candleShort] = await Promise.all([
          loadModel(prayerTableModelModule),
          loadModel(crossModelModule),
          loadModel(bibleModelModule),
          loadOptionalModel(candleTallModelModule),
          loadOptionalModel(candleShortModelModule),
        ]);

        if (!isMounted) {
          disposeObject3D(prayerTable);
          disposeObject3D(cross);
          disposeObject3D(bible);
          disposeObject3D(candleTall);
          disposeObject3D(candleShort);
          return;
        }

        setModelSet({ prayerTable, cross, bible, candleTall, candleShort });
        onStageActivated?.();
      } catch {
        if (isMounted) {
          onError('modelLoadFailed');
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [
    bibleModelModule,
    candleShortModelModule,
    candleTallModelModule,
    crossModelModule,
    onError,
    onStageActivated,
    prayerTableModelModule,
  ]);

  if (!modelSet || !canMountCanvas) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <Canvas camera={{ position: [0, 1.4, 4.7], fov: 34 }} gl={createNativeCanvasRenderer}>
        <PrayerCorner3DSceneContent modelSet={modelSet} sceneStyle={sceneStyle} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
