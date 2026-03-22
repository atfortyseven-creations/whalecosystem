"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BackgroundElements() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef} position={[0, 0, -5]}>
          <icosahedronGeometry args={[4, 15]} />
          <MeshDistortMaterial
            color="#4f46e5"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={1}
            transmission={0.5}
            // @ts-ignore
            thickness={2}
          />
        </mesh>
      </Float>
      
      {/* Ambient particles */}
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={1 + Math.abs(Math.sin(i)) * 1.5} rotationIntensity={2} floatIntensity={1}>
          <mesh position={[
            (Math.sin(i * 1234.5678) - 0.5) * 20,
            (Math.cos(i * 9876.5432) - 0.5) * 20,
            (Math.sin(i * 1357.9246) - 0.5) * 20
          ]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={2} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export function ImmersiveBackground({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const isLight = theme === 'light';
  return (
    <div className={`fixed inset-0 z-0 ${isLight ? 'bg-white' : 'bg-black'}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <color attach="background" args={[isLight ? '#ffffff' : '#000000']} />
        <ambientLight intensity={isLight ? 1.5 : 0.5} />
        <pointLight position={[10, 10, 10]} intensity={isLight ? 3 : 2} color={isLight ? "#6366f1" : "#4f46e5"} />
        <pointLight position={[-10, -10, -10]} intensity={isLight ? 2 : 1} color={isLight ? "#d946ef" : "#c026d3"} />
        <BackgroundElements />
      </Canvas>
      {/* Overlay gradient for better text readability */}
      <div className={`absolute inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-b from-white/30 via-transparent to-white/60' : 'bg-gradient-to-b from-black/60 via-transparent to-black/80'}`} />
      <div className={`absolute inset-0 bg-[url('/grid.svg')] pointer-events-none ${isLight ? 'opacity-[0.05] invert' : 'opacity-[0.03]'}`} style={{ backgroundSize: '40px 40px' }} />
    </div>
  );
}

