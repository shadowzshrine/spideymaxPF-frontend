"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProjectsScene() {
  const groupRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const projects = [
    { id: 1, pos: [-1.4, 0.8, 0], color: '#E50914' },
    { id: 2, pos: [1.4, 0.2, -0.4], color: '#00A8FF' },
    { id: 3, pos: [-1.4, -0.6, 0.4], color: '#E50914' },
    { id: 4, pos: [1.4, -1.2, 0], color: '#00A8FF' }
  ];

  const panelRefs = useRef([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, pointer.x, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, pointer.y, 0.05);

    projects.forEach((proj, idx) => {
      const ref = panelRefs.current[idx];
      if (!ref) return;

      ref.position.y = proj.pos[1] + Math.sin(time * 0.7 + idx) * 0.08;
      
      ref.rotation.y = Math.sin(time * 0.15 + idx) * 0.05 + mouseRef.current.x * 0.2;
      ref.rotation.x = -mouseRef.current.y * 0.15;
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.03) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {projects.map((proj, idx) => (
        <group
          key={proj.id}
          ref={(el) => (panelRefs.current[idx] = el)}
          position={[proj.pos[0], proj.pos[1], proj.pos[2]]}
        >
          <mesh>
            <boxGeometry args={[2.4, 1.4, 0.05]} />
            <meshBasicMaterial color="#0C0C12" />
          </mesh>

          <mesh>
            <boxGeometry args={[2.42, 1.42, 0.06]} />
            <meshBasicMaterial
              color={proj.color}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>

          {[
            [-1.2, 0.7],
            [1.2, 0.7],
            [-1.2, -0.7],
            [1.2, -0.7]
          ].map(([cx, cy], cIdx) => (
            <group key={cIdx} position={[cx, cy, 0.04]}>
              <mesh>
                <boxGeometry args={[0.1, 0.02, 0.01]} />
                <meshBasicMaterial color={proj.color} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.1, 0.02, 0.01]} />
                <meshBasicMaterial color={proj.color} />
              </mesh>
            </group>
          ))}

          <group position={[0, 0, 0.03]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[1.8, 0.04, 0.01]} />
              <meshBasicMaterial color="#1F1F2E" />
            </mesh>
            <mesh position={[-0.4, -0.4, 0.005]}>
              <boxGeometry args={[1.0, 0.04, 0.01]} />
              <meshBasicMaterial color={proj.color} />
            </mesh>

            <mesh position={[0.5, 0.2, 0]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshBasicMaterial color={proj.color} transparent opacity={0.8} />
            </mesh>
            <mesh position={[-0.5, 0.1, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshBasicMaterial color="#3F3F46" />
            </mesh>
          </group>
        </group>
      ))}

      <group>
        {projects.map((proj, idx) => {
          if (idx === projects.length - 1) return null;
          const nextProj = projects[idx + 1];
          const points = [
            new THREE.Vector3(...proj.pos),
            new THREE.Vector3(...nextProj.pos)
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={idx} geometry={lineGeom}>
              <lineBasicMaterial color="#3F3F46" transparent opacity={0.2} />
            </line>
          );
        })}
      </group>
    </group>
  );
}
