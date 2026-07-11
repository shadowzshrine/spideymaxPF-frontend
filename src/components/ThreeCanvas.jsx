"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CityscapeScene from './CityscapeScene';
import ScrollHandler from './ScrollHandler';

import HeroScene from './HeroScene';
import AboutScene from './AboutScene';
import SkillsScene from './SkillsScene';
import ProjectsScene from './ProjectsScene';
import ContactScene from './ContactScene';

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-spidey-dark pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 60 }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 4, 18]} />

        <ambientLight intensity={0.08} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={0.4}
          color="#00A8FF"
        />
        <directionalLight
          position={[-5, -15, 2]}
          intensity={0.6}
          color="#E50914"
        />

        <Suspense fallback={null}>
          <ScrollHandler />

          <CityscapeScene />

          {/* Section 1: Hero Scene at y = 0 */}
          <group position={[0, 0, 0]}>
            <HeroScene />
          </group>

          {/* Section 2: About Scene at y = -6 */}
          <group position={[0, -6, 0]}>
            <AboutScene />
          </group>

          {/* Section 3: Skills Scene at y = -14 */}
          <group position={[0, -14, 0]}>
            <SkillsScene />
          </group>

          {/* Section 4: Projects Scene at y = -24 */}
          <group position={[0, -24, 0]}>
            <ProjectsScene />
          </group>

          {/* Section 5: Contact Scene at y = -33 */}
          <group position={[0, -33, 0]}>
            <ContactScene />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
