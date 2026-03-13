/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber/native';
import React, { memo, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

import { BuddhistPrayerColors } from '@/constants/buddhist-prayer/theme';
import type { AltarProps } from '@/constants/buddhist-prayer/types';

type AltarScene3DProps = Required<
  Pick<
    AltarProps,
    'scale' | 'rotation' | 'showHalo' | 'showIncenseSmoke' | 'glowIntensity' | 'animated'
  >
> & {
  onReady?: () => void;
};

const CAMERA_POSITION = [0, 1.2, 4.8] as const;
const FLOOR_ROTATION_X = -Math.PI / 2;
const LOTUS_PETAL_POSITIONS = [
  [0, -0.75, 0.45],
  [0.42, -0.72, 0.24],
  [0.42, -0.72, -0.24],
  [0, -0.75, -0.45],
  [-0.42, -0.72, -0.24],
  [-0.42, -0.72, 0.24],
] as const;

function LotusPetals() {
  return (
    <>
      {LOTUS_PETAL_POSITIONS.map(([x, y, z], index) => (
        <mesh
          key={`${x}-${y}-${z}`}
          position={[x, y, z]}
          rotation={[Math.PI / 2.4, (index * Math.PI) / 3, Math.PI / 4]}
          scale={[0.42, 0.18, 0.72]}
        >
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#F1D59D' : '#D7A95A'}
            metalness={0.25}
            roughness={0.28}
          />
        </mesh>
      ))}
    </>
  );
}

function Candle({ position, animated }: { position: [number, number, number]; animated: boolean }) {
  const flameRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const material = flameRef.current?.material;
    if (!(material instanceof MeshStandardMaterial)) {
      return;
    }

    material.emissiveIntensity = animated ? 1.4 + Math.sin(clock.getElapsedTime() * 4) * 0.18 : 1.2;
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.7, 24]} />
        <meshStandardMaterial color="#F7E9C5" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.28, 0]} ref={flameRef}>
        <coneGeometry args={[0.09, 0.24, 16]} />
        <meshStandardMaterial
          color="#FFBF5E"
          emissive="#FF9F3F"
          emissiveIntensity={1.2}
          metalness={0}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        color="#FFCB6B"
        intensity={animated ? 0.8 : 0.55}
        distance={2.4}
        position={[0, 0.3, 0.2]}
      />
    </group>
  );
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

      const elapsed = clock.getElapsedTime() + index * 0.42;
      const material = mesh.material;
      const yOffset = animated ? (elapsed % 2.8) * 0.16 : index * 0.12;

      mesh.position.x = position[0] + Math.sin(elapsed * 0.7) * 0.03;
      mesh.position.y = position[1] + index * 0.14 + yOffset;
      mesh.position.z = position[2] + Math.cos(elapsed * 0.45) * 0.02;

      const scale = animated ? 0.7 + index * 0.16 + (elapsed % 1.2) * 0.08 : 0.82 + index * 0.12;
      mesh.scale.setScalar(scale);

      if (material instanceof MeshStandardMaterial) {
        material.opacity = showIncenseSmoke ? Math.max(0.08, 0.22 - index * 0.04) : 0;
      }
    });
  });

  return (
    <>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[position[0], position[1] + index * 0.14, position[2]]}
          ref={(mesh) => {
            smokeRefs.current[index] = mesh;
          }}
        >
          <sphereGeometry args={[0.12 + index * 0.04, 18, 18]} />
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
  showHalo,
  showIncenseSmoke,
  glowIntensity,
  animated,
}: AltarScene3DProps) {
  const altarRef = useRef<Group>(null);
  const haloRef = useRef<Mesh>(null);
  const baseRotation = useMemo(() => THREE.MathUtils.degToRad(rotation), [rotation]);

  useFrame(({ clock }) => {
    if (!altarRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const glowPulse = animated ? 1 + Math.sin(elapsed * 1.4) * 0.04 : 1;
    altarRef.current.scale.setScalar(scale * glowPulse);
    altarRef.current.rotation.y = baseRotation + (animated ? Math.sin(elapsed * 0.5) * 0.06 : 0);
    altarRef.current.position.y = animated ? Math.sin(elapsed * 0.8) * 0.04 : 0;

    const haloMaterial = haloRef.current?.material;
    if (haloMaterial instanceof MeshStandardMaterial) {
      haloMaterial.opacity = showHalo ? Math.min(0.36, 0.14 + glowIntensity * 0.08) : 0;
      haloMaterial.emissiveIntensity = showHalo ? Math.min(2.4, glowIntensity * 1.5) : 0;
    }
  });

  return (
    <>
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.95} />
      <directionalLight color="#FFF4D7" intensity={1.45} position={[3.6, 4.8, 2.4]} />
      <pointLight
        color={BuddhistPrayerColors.goldPrimary}
        intensity={showHalo ? Math.max(1.6, glowIntensity * 2.4) : 0.6}
        distance={6.5}
        position={[0, 1.85, 1.2]}
      />

      <mesh rotation={[FLOOR_ROTATION_X, 0, 0]} position={[0, -1.28, 0]}>
        <circleGeometry args={[2.8, 48]} />
        <meshStandardMaterial color="#26170F" roughness={0.96} />
      </mesh>

      <group ref={altarRef}>
        <mesh position={[0, 1.02, -0.46]} ref={haloRef}>
          <sphereGeometry args={[0.88, 36, 36]} />
          <meshStandardMaterial
            color="#FFE1A3"
            emissive="#F3C96C"
            emissiveIntensity={1.5}
            transparent
            opacity={0.22}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.92, 0]}>
          <cylinderGeometry args={[0.95, 1.12, 0.36, 36]} />
          <meshStandardMaterial color="#7C5625" metalness={0.36} roughness={0.42} />
        </mesh>

        <LotusPetals />

        <mesh position={[0, -0.34, 0]}>
          <cylinderGeometry args={[0.72, 0.88, 0.28, 32]} />
          <meshStandardMaterial color="#B98941" metalness={0.38} roughness={0.28} />
        </mesh>

        <group position={[0, 0.28, 0]}>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.48, 0.62, 0.9, 28]} />
            <meshStandardMaterial
              color="#B38B48"
              emissive="#A06E29"
              emissiveIntensity={0.15 + glowIntensity * 0.1}
              metalness={0.42}
              roughness={0.36}
            />
          </mesh>
          <mesh position={[0, 0.56, 0]}>
            <sphereGeometry args={[0.24, 24, 24]} />
            <meshStandardMaterial color="#D2AF69" metalness={0.3} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0.12, 0.46]} rotation={[-0.16, 0, 0]}>
            <torusGeometry args={[0.26, 0.06, 16, 48]} />
            <meshStandardMaterial color="#C8A15C" metalness={0.22} roughness={0.44} />
          </mesh>
        </group>

        <Candle position={[-1.3, -0.02, 0.22]} animated={animated} />
        <Candle position={[1.3, -0.02, 0.22]} animated={animated} />

        <group position={[0, -0.68, 1.05]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.5, 0.18, 32]} />
            <meshStandardMaterial color="#6B4724" metalness={0.28} roughness={0.55} />
          </mesh>
          <mesh position={[-0.12, 0.24, -0.04]} rotation={[-0.08, 0.02, 0.02]}>
            <cylinderGeometry args={[0.03, 0.04, 0.48, 12]} />
            <meshStandardMaterial color="#3F2A16" roughness={0.78} />
          </mesh>
          <mesh position={[0.12, 0.24, 0.04]} rotation={[-0.1, -0.04, -0.02]}>
            <cylinderGeometry args={[0.03, 0.04, 0.48, 12]} />
            <meshStandardMaterial color="#3F2A16" roughness={0.78} />
          </mesh>
          <IncenseSmoke
            animated={animated}
            position={[0, 0.3, 0]}
            showIncenseSmoke={showIncenseSmoke}
          />
        </group>
      </group>
    </>
  );
}

export const AltarScene3D = memo(function AltarScene3D(props: AltarScene3DProps) {
  const { onReady, ...sceneProps } = props;

  return (
    <Canvas
      camera={{ fov: 34, position: CAMERA_POSITION }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => onReady?.()}
    >
      <AltarSceneContent {...sceneProps} />
    </Canvas>
  );
});
