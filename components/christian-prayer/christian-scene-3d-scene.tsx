import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei/native';
import { Group } from 'three';
import { SCENE_LIGHTING, DEFAULT_SCENE_CONFIG } from '@/constants/christian-prayer/scene-config';

function WoodenTableModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(DEFAULT_SCENE_CONFIG.modelPath);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={DEFAULT_SCENE_CONFIG.scale}
      position={DEFAULT_SCENE_CONFIG.position}
      rotation={DEFAULT_SCENE_CONFIG.rotation}
    >
      <primitive object={scene} />
    </group>
  );
}

function CrossModel() {
  return (
    <group position={[0, 0.6, -1.5]}>
      {/* Vertical beam */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
      {/* Horizontal beam */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.24, 0.05, 0.05]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CandleModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Candle body */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 12]} />
        <meshStandardMaterial color="#F5E6C8" roughness={0.6} />
      </mesh>
      {/* Flame (point light source) */}
      <pointLight color="#FF9040" intensity={0.5} distance={0.8} position={[0, 0.12, 0]} />
    </group>
  );
}

export function ChristianScene3DScene() {
  return (
    <Canvas
      style={{ flex: 1 }}
      camera={{ position: [0, 0.5, 2.5], fov: 60 }}
    >
      <ambientLight intensity={SCENE_LIGHTING.ambientIntensity} />
      <directionalLight
        intensity={SCENE_LIGHTING.directionalIntensity}
        position={SCENE_LIGHTING.directionalPosition}
        castShadow
      />

      <Suspense fallback={null}>
        <WoodenTableModel />
      </Suspense>

      <CrossModel />
      <CandleModel position={[-0.25, 0.05, -1.3]} />
      <CandleModel position={[0.25, 0.05, -1.3]} />

      <Environment preset="apartment" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
