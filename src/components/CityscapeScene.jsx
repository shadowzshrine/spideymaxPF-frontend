"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CityscapeScene() {
  const groupRef = useRef();
  const particleRef = useRef();

  // Generate building positions and sizes
  const buildings = useMemo(() => {
    const list = [];
    const count = 45;
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * -60 + 10;
      const z = -Math.random() * 20 - 5;
      
      const width = Math.random() * 3 + 1.5;
      const height = Math.random() * 12 + 6;
      const depth = Math.random() * 3 + 1.5;
      
      const colorRand = Math.random();
      const neonColor = colorRand > 0.65 ? '#E50914' : colorRand > 0.3 ? '#00A8FF' : '#3F3F46';
      const glowIntensity = Math.random() * 1.5 + 0.5;

      list.push({ x, y, z, width, height, depth, neonColor, glowIntensity });
    }
    return list;
  }, []);

  // Generate background particles (dust/sparks)
  const particles = useMemo(() => {
    const count = 250;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = [];

    const redColor = new THREE.Color('#E50914');
    const blueColor = new THREE.Color('#0055FF');
    const whiteColor = new THREE.Color('#A1A1AA');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * -70 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const rand = Math.random();
      let chosenColor = whiteColor;
      if (rand > 0.6) chosenColor = redColor;
      else if (rand > 0.2) chosenColor = blueColor;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      speeds.push({
        y: Math.random() * 0.05 + 0.01,
        x: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    return { positions, colors, speeds };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.03;
    }

    if (particleRef.current) {
      const positions = particleRef.current.geometry.attributes.position.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const speed = particles.speeds[i];
        
        positions[i * 3 + 1] += speed.y;
        positions[i * 3] += Math.sin(time + i) * speed.x;
        
        if (positions[i * 3 + 1] > 20) {
          positions[i * 3 + 1] = -50;
        }
      }
      particleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group groupRef={groupRef}>
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation={true}
        />
      </points>

      {buildings.map((b, idx) => (
        <group key={idx} position={[b.x, b.y, b.z]}>
          <mesh>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshBasicMaterial color="#030305" />
          </mesh>

          <mesh>
            <boxGeometry args={[b.width + 0.02, b.height + 0.02, b.depth + 0.02]} />
            <meshBasicMaterial
              color={b.neonColor}
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>

          <group>
            {[
              [-b.width/2, -b.depth/2],
              [b.width/2, -b.depth/2],
              [-b.width/2, b.depth/2],
              [b.width/2, b.depth/2],
            ].map(([cx, cz], pIdx) => (
              <mesh key={pIdx} position={[cx, 0, cz]}>
                <boxGeometry args={[0.08, b.height, 0.08]} />
                <meshBasicMaterial
                  color={b.neonColor}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}
