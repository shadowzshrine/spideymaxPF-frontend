"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SkillsScene() {
  const groupRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const categories = useMemo(() => [
    { name: 'Frontend', pos: new THREE.Vector3(-1.8, 0.8, 0.2), color: '#00A8FF' },
    { name: 'Backend', pos: new THREE.Vector3(1.8, 0.6, -0.4), color: '#E50914' },
    { name: 'Mobile', pos: new THREE.Vector3(-1.6, -0.8, 0.5), color: '#00A8FF' },
    { name: 'Design', pos: new THREE.Vector3(1.5, -0.8, -0.2), color: '#E50914' },
    { name: 'Utilities', pos: new THREE.Vector3(0, 1.3, 0.3), color: '#ffffff' },
    { name: 'AI/IDE', pos: new THREE.Vector3(0, -1.3, -0.3), color: '#E50914' }
  ], []);

  const subNodes = useMemo(() => {
    const list = [];
    categories.forEach((cat, cIdx) => {
      const subCount = 3 + (cIdx % 2);
      for (let s = 0; s < subCount; s++) {
        const radius = 0.5 + Math.random() * 0.3;
        const angle = (s * Math.PI * 2) / subCount;
        
        const offset = new THREE.Vector3(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          (Math.random() - 0.5) * 0.3
        );

        list.push({
          parentIdx: cIdx,
          offset,
          speed: 0.5 + Math.random() * 0.8,
          phase: Math.random() * Math.PI,
          color: cat.color
        });
      }
    });
    return list;
  }, [categories]);

  const parentRefs = useRef([]);
  const subNodeRefs = useRef([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, pointer.x * 3.5, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, pointer.y * 2.5, 0.05);

    const mouseVec = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);

    categories.forEach((cat, idx) => {
      const ref = parentRefs.current[idx];
      if (!ref) return;

      const basePos = cat.pos.clone();
      basePos.y += Math.sin(time * 0.8 + idx) * 0.08;
      basePos.x += Math.cos(time * 0.6 + idx) * 0.08;

      const dist = basePos.distanceTo(mouseVec);
      if (dist < 1.8) {
        const pull = (1.0 - dist / 1.8) * 0.2;
        const dir = new THREE.Vector3().subVectors(mouseVec, basePos).normalize();
        basePos.addScaledVector(dir, pull);

        const targetScale = 1.0 + (1.0 - dist / 1.8) * 0.4;
        ref.scale.setScalar(THREE.MathUtils.lerp(ref.scale.x, targetScale, 0.1));
      } else {
        ref.scale.setScalar(THREE.MathUtils.lerp(ref.scale.x, 1.0, 0.1));
      }

      ref.position.copy(basePos);
    });

    subNodes.forEach((sub, idx) => {
      const ref = subNodeRefs.current[idx];
      const parentRef = parentRefs.current[sub.parentIdx];
      if (!ref || !parentRef) return;

      const angle = time * 0.6 * sub.speed + sub.phase;
      const radius = sub.offset.length();
      
      const rotatedOffset = new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle) * 0.7,
        radius * Math.sin(angle) * 0.5
      );

      const targetPos = parentRef.position.clone().add(rotatedOffset);
      ref.position.copy(targetPos);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.05;
      groupRef.current.rotation.z = Math.cos(time * 0.03) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {categories.map((cat, idx) => (
        <mesh
          key={idx}
          ref={(el) => (parentRefs.current[idx] = el)}
          position={[cat.pos.x, cat.pos.y, cat.pos.z]}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={cat.color} transparent opacity={0.9} />
          
          <mesh>
            <torusGeometry args={[0.22, 0.015, 6, 24]} />
            <meshBasicMaterial color={cat.color} transparent opacity={0.4} />
          </mesh>
        </mesh>
      ))}

      {subNodes.map((sub, idx) => (
        <mesh
          key={idx}
          ref={(el) => (subNodeRefs.current[idx] = el)}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={sub.color} transparent opacity={0.7} />
        </mesh>
      ))}

      <group>
        {categories.map((cat, idx) => {
          const points = [new THREE.Vector3(0, 0, 0), cat.pos];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={`center-${idx}`} geometry={lineGeom}>
              <lineBasicMaterial color="#3F3F46" transparent opacity={0.2} />
            </line>
          );
        })}

        {categories.map((cat, idx) => {
          const nextCat = categories[(idx + 1) % categories.length];
          const points = [cat.pos, nextCat.pos];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={`inter-${idx}`} geometry={lineGeom}>
              <lineBasicMaterial color="#1F1F2E" transparent opacity={0.15} />
            </line>
          );
        })}

        {subNodes.map((sub, idx) => {
          const parent = categories[sub.parentIdx];
          const parentPos = parent.pos;
          const points = [parentPos, parentPos.clone().add(sub.offset)];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          return (
            <line key={`sub-${idx}`} geometry={lineGeom}>
              <lineBasicMaterial color={sub.color} transparent opacity={0.3} />
            </line>
          );
        })}
      </group>
    </group>
  );
}
