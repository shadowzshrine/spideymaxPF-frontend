"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HeroScene() {
  const lineRef = useRef();
  const pointsRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const NUM_SPOKES = 14;
  const NUM_RINGS = 9;
  const MAX_RADIUS = 3.5;

  const { spokesData, ringsData } = useMemo(() => {
    const spokes = [];
    const rings = [];

    for (let s = 0; s < NUM_SPOKES; s++) {
      const angle = (s * Math.PI * 2) / NUM_SPOKES;
      const spokePoints = [];
      const pointsCount = 10;
      
      for (let p = 0; p <= pointsCount; p++) {
        const pct = p / pointsCount;
        const radius = pct * MAX_RADIUS;
        const angleNoise = (Math.random() - 0.5) * 0.02;
        spokePoints.push(
          new THREE.Vector3(
            radius * Math.cos(angle + angleNoise),
            radius * Math.sin(angle + angleNoise),
            (Math.random() - 0.5) * 0.05
          )
        );
      }
      spokes.push(spokePoints);
    }

    for (let r = 1; r <= NUM_RINGS; r++) {
      const radiusPct = r / NUM_RINGS;
      const radius = radiusPct * MAX_RADIUS;

      for (let s = 0; s < NUM_SPOKES; s++) {
        const nextS = (s + 1) % NUM_SPOKES;
        const a1 = (s * Math.PI * 2) / NUM_SPOKES;
        const a2 = (nextS * Math.PI * 2) / NUM_SPOKES;
        const midA = (a1 + a2) / 2;

        const p1 = new THREE.Vector3(radius * Math.cos(a1), radius * Math.sin(a1), 0);
        const p2 = new THREE.Vector3(radius * Math.cos(a2), radius * Math.sin(a2), 0);
        
        const sagFactor = 0.88; 
        const pmid = new THREE.Vector3(
          radius * Math.cos(midA) * sagFactor,
          radius * Math.sin(midA) * sagFactor,
          (Math.random() - 0.5) * 0.08
        );

        rings.push({ p1, pmid, p2 });
      }
    }

    return { spokesData: spokes, ringsData: rings };
  }, []);

  const totalLineVerts = (NUM_SPOKES * 10 * 2) + (ringsData.length * 4);
  const initialPositions = useMemo(() => {
    return new Float32Array(totalLineVerts * 3);
  }, [totalLineVerts]);

  const basePoints = useMemo(() => {
    const list = [];
    
    spokesData.forEach((spoke) => {
      for (let i = 0; i < spoke.length - 1; i++) {
        list.push(spoke[i].clone());
        list.push(spoke[i + 1].clone());
      }
    });

    ringsData.forEach((ring) => {
      list.push(ring.p1.clone());
      list.push(ring.pmid.clone());
      list.push(ring.pmid.clone());
      list.push(ring.p2.clone());
    });

    return list;
  }, [spokesData, ringsData]);

  const lineColors = useMemo(() => {
    const colors = new Float32Array(totalLineVerts * 3);
    const redCol = new THREE.Color('#E50914');
    const blueCol = new THREE.Color('#0052B4');

    for (let i = 0; i < totalLineVerts; i++) {
      const basePt = basePoints[i];
      const dist = basePt.length();
      const pct = Math.min(dist / MAX_RADIUS, 1);
      
      const lerpedCol = redCol.clone().lerp(blueCol, pct);
      colors[i * 3] = lerpedCol.r;
      colors[i * 3 + 1] = lerpedCol.g;
      colors[i * 3 + 2] = lerpedCol.b;
    }
    return colors;
  }, [basePoints, totalLineVerts]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, pointer.x * 4.5, 0.05);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, pointer.y * 4.5, 0.05);

    const mousePos = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.8);
    const posAttr = lineRef.current.geometry.attributes.position;
    const array = posAttr.array;

    for (let i = 0; i < totalLineVerts; i++) {
      const basePt = basePoints[i];
      
      const dist = basePt.length();
      const wave = Math.sin(time * 1.5 - dist * 1.2) * 0.08 * (dist / MAX_RADIUS);
      
      const tempPt = basePt.clone();
      tempPt.z += wave;

      const distToMouse = tempPt.distanceTo(mousePos);
      if (distToMouse < 2.5) {
        const force = (1.0 - distToMouse / 2.5) * 0.45;
        const dir = new THREE.Vector3().subVectors(mousePos, tempPt).normalize();
        tempPt.addScaledVector(dir, force);
      }

      array[i * 3] = tempPt.x;
      array[i * 3 + 1] = tempPt.y;
      array[i * 3 + 2] = tempPt.z;
    }

    posAttr.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
    }
  });

  return (
    <group ref={pointsRef}>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.7}
          linewidth={1.5}
        />
      </lineSegments>

      <group>
        {spokesData.map((spoke, sIdx) => 
          spoke.map((pt, pIdx) => {
            if (pIdx % 2 !== 0 || pIdx === 0) return null;
            return (
              <mesh key={`${sIdx}-${pIdx}`} position={[pt.x, pt.y, pt.z]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#E50914" transparent opacity={0.8} />
              </mesh>
            );
          })
        )}
      </group>
    </group>
  );
}
