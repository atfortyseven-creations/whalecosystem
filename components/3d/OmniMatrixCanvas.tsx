"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useVIPStore } from '@/lib/vip-store';

const PARTICLE_COUNT = 800;

/**
 * NetworkNodes: An InstancedMesh generating the 3D visual representation 
 * of the blockchain state. Draws 800 glowing spheres in an O(1) draw call.
 */
function NetworkNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Calculate fixed randomized data upfront
  const { positions, colorArray } = useMemo(() => {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    const c = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
       // Spread nodes across a large spatial volume
       const x = (Math.random() - 0.5) * 50;
       const y = (Math.random() - 0.5) * 50;
       const z = (Math.random() - 0.5) * 50;
       
       p[i * 3] = x;
       p[i * 3 + 1] = y;
       p[i * 3 + 2] = z;
       
       // Give them a default dull chromatic base
       const isHot = Math.random() > 0.8;
       if (isHot) {
           color.setHex(0xD4AF37); // Gold
       } else {
           color.setHex(0x111111); // Dark node
       }
       color.toArray(c, i * 3);
    }
    return { positions: p, colorArray: c };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update instance matrices only once
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      dummy.position.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy, positions]);

  // Connect to Zustand directly within the 120 FPS requestAnimationFrame loop
  // ensuring ZERO React re-renders while achieving massive visual changes.
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Slow planetary rotation
    meshRef.current.rotation.y += delta * 0.03;
    meshRef.current.rotation.x += delta * 0.01;

    // Real-time synchronization with the Store
    const events = useVIPStore.getState().whaleEvents;
    
    // Map the density of recent events to a kinetic scale 
    // Usually events.length is up to 1000
    const intensity = Math.min(events.length / 500, 1.0); 
    
    const targetScale = 1.0 + (intensity * 0.6);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.06, 12, 12]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

/**
 * The core 3D Visualizer wrapper. 
 * `pointer-events: none` enforces it serves STRICTLY as an immersive background.
 */
export function OmniMatrixCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[0] overflow-hidden bg-[#020202]">
      {/* 
        gl={{ antialias: false }} prevents multisampling overhead. 
        WebGL renders raw pixels, maintaining exact precision while saving GPU cycles. 
      */}
      <Canvas camera={{ position: [0, 0, 18], fov: 75 }} gl={{ alpha: false, antialias: false }}>
        <fog attach="fog" args={['#020202', 10, 40]} />
        
        {/* Procedural Data Constellation */}
        <NetworkNodes />
        <Stars radius={60} depth={50} count={2000} factor={3} saturation={0} fade speed={1.5} />
      </Canvas>
      
      {/* Hardware-accelerated radial vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at center, transparent 0%, #020202 90%)' }} 
      />
    </div>
  );
}
