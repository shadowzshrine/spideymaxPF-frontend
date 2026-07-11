"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AboutScene() {
  const groupRef = useRef();
  const screenRef = useRef();
  const hudWidgetRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, pointer.x, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, pointer.y, 0.05);

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.1;
      groupRef.current.rotation.y = mouseRef.current.x * 0.35;
      groupRef.current.rotation.x = -mouseRef.current.y * 0.25;
    }

    if (hudWidgetRef.current) {
      hudWidgetRef.current.rotation.y = time * 0.15;
    }

    if (screenRef.current) {
      screenRef.current.material.opacity = 0.25 + Math.sin(time * 8) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={screenRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 2.5, 12, 8]} />
        <meshBasicMaterial
          color="#00A8FF"
          wireframe
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[4.04, 2.54]} />
        <meshBasicMaterial
          color="#00A8FF"
          wireframe
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-1.7, 0.8, 0.1]}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshBasicMaterial color="#E50914" wireframe transparent opacity={0.6} />
      </mesh>

      <mesh position={[1.5, -0.6, 0.15]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 6]} />
        <meshBasicMaterial color="#00A8FF" wireframe transparent opacity={0.7} />
      </mesh>

      <group ref={hudWidgetRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[2.5, 0.015, 6, 48]} />
          <meshBasicMaterial color="#E50914" transparent opacity={0.4} />
        </mesh>

        {[0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3;
          return (
            <mesh
              key={i}
              position={[
                2.5 * Math.cos(angle),
                0,
                2.5 * Math.sin(angle)
              ]}
            >
              <dodecahedronGeometry args={[0.08]} />
              <meshBasicMaterial color="#E50914" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>

      <gridHelper args={[8, 8, '#3F3F46', '#27272A']} position={[0, -1.8, 0]} />
    </group>
  );
}
