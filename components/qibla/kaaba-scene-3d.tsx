/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { Group, Object3D } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { useDeferredNativeMount } from '@/hooks/use-deferred-native-mount';
import { createNativeCanvasRenderer, ensureNativeThreeEnvironment } from '@/lib/three-native';

ensureNativeThreeEnvironment();

interface KaabaScene3DProps {
  modelModule: number;
  onReady?: () => void;
}

function normalizeGltfScene(input: unknown): Object3D | null {
  if (!input || typeof input !== 'object') return null;
  if ('scene' in input && input.scene instanceof THREE.Object3D) return input.scene;
  if (input instanceof THREE.Object3D) return input;
  return null;
}

function centerModel(object: Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.6 / maxDim;

  // Apply scale first, then recompute the bbox so the center offset is
  // relative to the already-scaled model. Without this, models whose root node
  // has a rotation matrix (e.g. Z-up → Y-up conversion) end up placed hundreds
  // of world-units off-screen after scaling.
  object.scale.setScalar(scale);
  const scaledBox = new THREE.Box3().setFromObject(object);
  const center = scaledBox.getCenter(new THREE.Vector3());
  object.position.sub(center);
}

function isBackdropMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material];

  return materials.some((entry) => {
    const namedLikeBackdrop = /color_d06|background|backdrop|placeholder/i.test(entry.name);
    if (namedLikeBackdrop) return true;

    if (!('color' in entry) || !(entry.color instanceof THREE.Color)) {
      return false;
    }

    const { r, g, b } = entry.color;
    // Empirical thresholds for the flat gold backdrop material in the Kaaba model.
    // These values may need adjustment if the model source changes.
    const looksLikeFlatGold = r > 0.7 && g > 0.45 && g < 0.75 && b < 0.2;
    return looksLikeFlatGold;
  });
}

function removeBackdropMeshes(object: Object3D) {
  const removable: Object3D[] = [];

  object.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    if (!isBackdropMaterial(node.material)) return;

    removable.push(node);
  });

  removable.forEach((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry?.dispose();
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => mat?.dispose());
    }
    node.parent?.remove(node);
  });
}

function RotatingKaaba({ model }: { model: Object3D }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function KaabaSceneContent({ modelModule }: { modelModule: number }) {
  const [model, setModel] = useState<Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const asset = Asset.fromModule(modelModule);
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      if (!uri) throw new Error('No URI for Kaaba model');
      const gltf = await new GLTFLoader().loadAsync(uri);
      const obj = normalizeGltfScene(gltf);
      if (!cancelled && obj) {
        removeBackdropMeshes(obj);
        centerModel(obj);
        setModel(obj);
      }
    }

    load().catch((err) => {
      if (__DEV__) console.warn('[KaabaScene3D] model load failed:', err);
    });
    return () => {
      cancelled = true;
    };
  }, [modelModule]);

  if (!model) return null;

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight color="#FFE8A0" intensity={2.2} position={[2, 3, 2]} />
      <pointLight color="#FFD060" intensity={0.9} distance={8} position={[0, 1.5, 1.5]} />
      <RotatingKaaba model={model} />
    </>
  );
}

export function KaabaScene3D({ modelModule, onReady }: KaabaScene3DProps) {
  const canMountCanvas = useDeferredNativeMount();

  if (!canMountCanvas) {
    return null;
  }

  return (
    <Canvas
      camera={{ fov: 48, position: [0, 0.4, 3] }}
      gl={createNativeCanvasRenderer}
      style={styles.canvas}
      onCreated={() => onReady?.()}
    >
      <KaabaSceneContent modelModule={modelModule} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 68,
    height: 68,
  },
});
