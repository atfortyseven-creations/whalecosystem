"use client";

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SCROLL VELOCITY HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useScrollVelocity() {
  const vel = useRef(0);
  const last = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY;
      const raw = curr - last.current;
      vel.current = Math.max(-55, Math.min(55, vel.current + raw * 2.4));
      last.current = curr;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const dampen = () => {
      vel.current *= 0.88;
      raf.current = requestAnimationFrame(dampen);
    };
    raf.current = requestAnimationFrame(dampen);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return vel;
}

export function useScrollProgress() {
  const progress = useRef(0);
  
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    // Initialize
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  
  return progress;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITAL RING
// ─────────────────────────────────────────────────────────────────────────────
function OrbitalRing({ inclination, azimuth, vel, progress, baseSpeed, isDark, index }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    angle.current += dt * baseSpeed + vel.current * 0.0012;
    ref.current.rotation.y = angle.current;

    // ─── FRAGMENTATION EFFECT ───
    // Fragments wildly in the middle of the scroll (progress = 0.5), defragments at ends (0.0 and 1.0)
    const fragIntensity = Math.sin(progress.current * Math.PI); 
    // High-frequency chaos based on scroll
    const chaos = Math.sin(progress.current * 80 + index * 15);
    const offset = fragIntensity * chaos * 4.5; // Pushes rings up to 4.5 units away!

    ref.current.position.lerp(new THREE.Vector3(
      Math.sin(azimuth) * offset,
      Math.cos(inclination) * offset,
      Math.sin(inclination) * offset
    ), 0.08);
  });

  return (
    <mesh ref={ref} rotation={[inclination, azimuth, 0]}>
      <torusGeometry args={[2.8, 0.04, 64, 256]} />
      <meshPhysicalMaterial
        color={isDark ? "#ffffff" : "#222222"}
        metalness={1.0}
        roughness={0.15}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={isDark ? 2.0 : 3.0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ELECTRON
// ─────────────────────────────────────────────────────────────────────────────
function Electron({ inclination, azimuth, phase, orbitRadius, vel }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(phase);

  useFrame((_, dt) => {
    if (!groupRef.current || !meshRef.current) return;
    t.current += dt * 1.6 + Math.abs(vel.current) * 0.009;
    const x = Math.cos(t.current) * orbitRadius;
    const y = Math.sin(t.current) * orbitRadius;
    meshRef.current.position.set(x, y, 0);
  });

  return (
    <group ref={groupRef} rotation={[inclination, azimuth, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NUCLEUS
// ─────────────────────────────────────────────────────────────────────────────
function Nucleus({ vel, isDark }: any) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.3 + vel.current * 0.003;
    ref.current.rotation.x += dt * 0.12;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.55, 64, 64]} />
      <meshPhysicalMaterial
        color={isDark ? "#aaaaaa" : "#000000"}
        metalness={1.0}
        roughness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={isDark ? 2.5 : 4.0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOM GROUP
// ─────────────────────────────────────────────────────────────────────────────
function AtomGroup({ vel, progress, isDark, enableScale = false }: any) {
  const masterRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!masterRef.current) return;
    const targetSpin = vel.current * 0.02;
    masterRef.current.rotation.y += (targetSpin - masterRef.current.rotation.y) * 0.08;
    masterRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.25;

    if (enableScale) {
      // ─── MASSIVE PULSATING SCALE ───
      // Pules multiple times as you scroll.
      // Progress 0.0 -> 1.0. 
      // Math.sin(progress * PI * 8) gives 4 full heartbeat pulses.
      const pulse = Math.sin(progress.current * Math.PI * 8);
      // Scale fluctuates between 0.45 (tiny) and 2.2 (massive)
      const targetScale = 1.3 + (pulse * 0.85);
      
      masterRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    }
  });

  const RINGS = [
    { inclination: 0, azimuth: 0, speed: 0.28 },
    { inclination: Math.PI / 3, azimuth: Math.PI / 5, speed: 0.22 },
    { inclination: -Math.PI / 3, azimuth: -Math.PI / 5, speed: 0.32 },
  ];

  const ELECTRONS = [
    { inclination: 0, azimuth: 0, phase: 0 },
    { inclination: Math.PI / 3, azimuth: Math.PI / 5, phase: 2.1 },
    { inclination: -Math.PI / 3, azimuth: -Math.PI / 5, phase: 4.2 },
  ];

  return (
    <group ref={masterRef}>
      {RINGS.map((r, i) => (
        <OrbitalRing key={i} index={i} {...r} vel={vel} progress={progress} baseSpeed={r.speed} isDark={isDark} />
      ))}
      {ELECTRONS.map((e, i) => (
        <Electron key={i} {...e} orbitRadius={2.8} vel={vel} />
      ))}
      <Nucleus vel={vel} isDark={isDark} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────────────────────────────────────
function Scene({ vel, progress, isDark, enableScale }: any) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />

      <directionalLight position={[5, 5, 5]} intensity={isDark ? 3.0 : 6.0} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={isDark ? 1.5 : 3.0} color="#ffffff" />
      <directionalLight position={[0, 10, 0]} intensity={isDark ? 2.0 : 4.0} color="#ffffff" />
      <ambientLight intensity={isDark ? 1.0 : 2.0} color="#ffffff" />

      <Float speed={0.8} floatIntensity={0.3} rotationIntensity={0.1}>
        <AtomGroup vel={vel} progress={progress} isDark={isDark} enableScale={enableScale} />
      </Float>

      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={isDark ? 2.5 : 1.2} 
          levels={8} 
        />
        <DepthOfField 
          focusDistance={0.0} 
          focalLength={0.02} 
          bokehScale={2} 
          height={480} 
        />
        <ChromaticAberration 
          blendFunction={BlendFunction.NORMAL} 
          offset={new THREE.Vector2(0.0008, 0.0008)} 
        />
        <Noise opacity={isDark ? 0.05 : 0.025} />
        <Vignette eskil={false} offset={0.1} darkness={isDark ? 0.5 : 0.3} />
      </EffectComposer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function QDsAtomRenderer({ vel, isDark = false, enableScale = false }: { vel: React.MutableRefObject<number>, isDark?: boolean, enableScale?: boolean }) {
  const progress = useScrollProgress();

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', precision: 'highp' }}
      dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <Scene vel={vel} progress={progress} isDark={isDark} enableScale={enableScale} />
      </Suspense>
    </Canvas>
  );
}
