/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import React, { Suspense, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Group } from 'three';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const buddhaModel = require('../assets/models/buddha.glb');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lotusModel = require('../assets/models/lotus_pedestal.glb');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const candleModel = require('../assets/models/candle.glb');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const incenseModel = require('../assets/models/incense_bowl.glb');

interface BuddhistAltar3DProps {
  scale?: number;
  rotation?: number;
  showHalo?: boolean;
  showIncenseSmoke?: boolean;
  glowIntensity?: number;
  animated?: boolean;
}

const ModelPart = ({
  model,
  position = [0, 0, 0],
}: {
  model: number;
  position?: [number, number, number];
}) => {
  const gltf = useGLTF(model);
  const clone = useMemo(() => gltf.scene.clone() as Group, [gltf.scene]);
  return <primitive object={clone} position={position} />;
};

export const BuddhistAltar3D = ({
  scale = 1,
  rotation = 0,
  showHalo = true,
  showIncenseSmoke = true,
  glowIntensity = 1,
}: BuddhistAltar3DProps) => (
  <View style={styles.container}>
    <Canvas camera={{ position: [0, 1.2, 4], fov: 42 }}>
      <ambientLight intensity={0.4 * glowIntensity} />
      <directionalLight position={[2, 4, 3]} intensity={1.1 * glowIntensity} color="#E0B96E" />
      <Suspense fallback={null}>
        <group scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
          <ModelPart model={lotusModel} position={[0, -1.05, 0]} />
          <ModelPart model={buddhaModel} position={[0, -0.35, 0]} />
          <ModelPart model={candleModel} position={[-0.7, -0.9, 0.35]} />
          <ModelPart model={candleModel} position={[0.7, -0.9, 0.35]} />
          <ModelPart model={incenseModel} position={[0, -0.95, 0.78]} />
        </group>
      </Suspense>
    </Canvas>

    {showHalo ? <View style={styles.halo} pointerEvents="none" /> : null}
    {showIncenseSmoke ? <View style={styles.smoke} pointerEvents="none" /> : null}
  </View>
);

export const AltarLoadingState = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color="#E0B96E" />
    <Text style={styles.text}>Preparing sacred altar...</Text>
  </View>
);

export const AltarErrorState = ({ message }: { message: string }) => (
  <View style={styles.center}>
    <Text style={styles.text}>Unable to load altar scene</Text>
    <Text style={styles.error}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 260,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#0E0906',
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(224,185,110,0.06)',
  },
  smoke: {
    position: 'absolute',
    top: 40,
    left: '38%',
    width: 90,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 100,
  },
  center: { alignItems: 'center', justifyContent: 'center', minHeight: 240 },
  text: { color: '#F5EBD7', marginTop: 10 },
  error: { color: '#CFA6A6', marginTop: 4, fontSize: 12 },
});
