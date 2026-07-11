"use client";

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollHandler() {
  const { camera } = useThree();

  const scrollData = useRef({
    x: 0,
    y: 1.5,
    z: 9,
    tx: 0,
    ty: 0.5,
    tz: 0,
  });

  useEffect(() => {
    const data = scrollData.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(data, {
      x: 3.5,
      y: -6,
      z: 7,
      tx: -0.5,
      ty: -6,
      tz: -1,
      duration: 1,
      ease: 'power1.inOut',
    });

    tl.to(data, {
      x: -4.5,
      y: -14,
      z: 7,
      tx: 1.5,
      ty: -14,
      tz: 0,
      duration: 1,
      ease: 'power1.inOut',
    });

    tl.to(data, {
      x: 0,
      y: -24,
      z: 9.5,
      tx: 0,
      ty: -24,
      tz: 0,
      duration: 1,
      ease: 'power1.inOut',
    });

    tl.to(data, {
      x: 0,
      y: -33,
      z: 5.5,
      tx: 0,
      ty: -33.5,
      tz: 0,
      duration: 1,
      ease: 'power1.inOut',
    });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  useFrame(() => {
    const data = scrollData.current;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, data.x, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, data.y, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, data.z, 0.06);

    const currentTargetX = THREE.MathUtils.lerp(camera.userData.tx || 0, data.tx, 0.06);
    const currentTargetY = THREE.MathUtils.lerp(camera.userData.ty || 0, data.ty, 0.06);
    const currentTargetZ = THREE.MathUtils.lerp(camera.userData.tz || 0, data.tz, 0.06);

    camera.userData.tx = currentTargetX;
    camera.userData.ty = currentTargetY;
    camera.userData.tz = currentTargetZ;

    camera.lookAt(currentTargetX, currentTargetY, currentTargetZ);
  });

  return null;
}
