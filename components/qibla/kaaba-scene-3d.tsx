/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { Group, Object3D } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { useDeferredNativeMount } from '@/hooks/use-deferred-native-mount';

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
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.6 / maxDim;
  object.position.sub(center);
  object.scale.setScalar(scale);
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
        centerModel(obj);
        setModel(obj);
      }
    }

    load().catch(() => {});
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
      gl={{ antialias: true, alpha: true }}
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
