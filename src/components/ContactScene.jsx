"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ContactScene() {
  const coreRef = useRef();
  const wave1Ref = useRef();
  const wave2Ref = useRef();
  const particlesRef = useRef();

  const sparkCount = 80;
  const sparks = useMemo(() => {
    const list = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.floor(Math.random() * 8) * Math.PI * 2) / 8;
      const startDist = 3 + Math.random() * 2;
      
      list.push({
        angle,
        dist: startDist,
        speed: 0.02 + Math.random() * 0.03,
        yOffset: (Math.random() - 0.5) * 0.1
      });
    }
    
    const positions = new Float32Array(sparkCount * 3);
    return { list, positions };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (coreRef.current) {
      const pulse = 1.0 + Math.sin(time * 3) * 0.08;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y = time * 0.5;
      coreRef.current.rotation.x = time * 0.25;
    }

    if (wave1Ref.current) {
      wave1Ref.current.scale.setScalar((time * 0.5) % 2.5);
      wave1Ref.current.material.opacity = 1.0 - ((time * 0.5) % 2.5) / 2.5;
    }
    if (wave2Ref.current) {
      wave2Ref.current.scale.setScalar(((time * 0.5) + 1.25) % 2.5);
      wave2Ref.current.material.opacity = 1.0 - (((time * 0.5) + 1.25) % 2.5) / 2.5;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      sparks.list.forEach((spark, idx) => {
        spark.dist -= spark.speed;
        if (spark.dist <= 0.1) {
          spark.dist = 4 + Math.random() * 2;
        }

        positions[idx * 3] = spark.dist * Math.cos(spark.angle);
        positions[idx * 3 + 1] = spark.dist * Math.sin(spark.angle) + spark.yOffset;
        positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.05;
      });

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#E50914" wireframe />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh ref={wave1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.015, 6, 32]} />
        <meshBasicMaterial color="#E50914" transparent opacity={1} />
      </mesh>
      <mesh ref={wave2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.015, 6, 32]} />
        <meshBasicMaterial color="#00A8FF" transparent opacity={1} />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparks.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#E50914"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      <group>
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 8;
          const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(5 * Math.cos(angle), 5 * Math.sin(angle), 0)
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={idx} geometry={lineGeom}>
              <lineBasicMaterial color="#27272A" transparent opacity={0.25} />
            </line>
          );
        })}
      </group>
    </group>
  );
}
