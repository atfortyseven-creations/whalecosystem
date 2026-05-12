"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Star = ({ speed, color }: { speed: number; color: string }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  // Create a hyperdrive "streak" look
  const item = useMemo(() => {
    const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const angle = secureRandom() * Math.PI * 2;
    const radius = secureRandom() * 500 + 50; // Don't start too close to center
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = secureRandom() * -2000; // Start far away
    return { x, y, z, angle, secureRandom };
  }, []);

  useFrame((state, delta) => {
    // Forward motion (towards camera)
    mesh.current.position.z += speed * delta * 2000;
    
    // Spread away from center as it gets closer (parallax/perspective)
    mesh.current.position.x += Math.cos(item.angle) * speed * delta * 100;
    mesh.current.position.y += Math.sin(item.angle) * speed * delta * 100;

    // Reset stars that go past the camera
    if (mesh.current.position.z > 500) {
      mesh.current.position.z = -1500;
      // Reset x/y to initial radius to prevent flying out too far over time
      const radius = item.secureRandom() * 500 + 50;
      mesh.current.position.x = Math.cos(item.angle) * radius;
      mesh.current.position.y = Math.sin(item.angle) * radius;
    }
    
    // Length increases with speed
    mesh.current.scale.z = 1 + (speed * 10);
  });

  return (
    <mesh ref={mesh} position={[item.x, item.y, item.z]} rotation={[0, 0, item.angle]}>
      <boxGeometry args={[0.8, 0.8, 40]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const StarfieldScene = () => {
  const starsCount = 800;
  const stars = useMemo(() => {
    const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    return Array.from({ length: starsCount }).map((_, i) => ({
      id: i,
      speed: secureRandom() * 0.8 + 0.2,
      color: i % 10 === 0 ? '#60a5fa' : '#ffffff', // Subtle blue hints
    }));
  }, []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      {stars.map((star) => (
        <Star key={star.id} speed={star.speed} color={star.color} />
      ))}
      <fog attach="fog" args={['#000000', 100, 1500]} />
    </>
  );
};

export default function Starfield() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 500], fov: 75, near: 0.1, far: 2000 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <StarfieldScene />
      </Canvas>
      {/* Vignette for cinematic focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}

