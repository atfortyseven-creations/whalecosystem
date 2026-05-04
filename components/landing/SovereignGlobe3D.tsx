"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — Minimalist Uniform Dot Sphere ─────────────────────────
// Elegant, high-fidelity Fibonacci sphere with no continents, pure uniformity.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 18000; 
const GLOBE_RADIUS = 1.0;
const BG_COLOR = "#FAF9F6"; // Matches the Ivory background
const DOT_COLOR = "#3F3F46"; // Elegant dark gray

function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const color = useMemo(() => new THREE.Color(DOT_COLOR), []);

  useEffect(() => {
    if (!meshRef.current) return;
    
    const PHI = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      
      dummy.position.set(
        Math.cos(theta) * r * GLOBE_RADIUS,
        y * GLOBE_RADIUS,
        Math.sin(theta) * r * GLOBE_RADIUS
      );
      
      // Make discs face outward perfectly
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy, color]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      <circleGeometry args={[0.007, 12]} />
      {/* Basic material avoids lighting calculations on dots, keeping them crisp */}
      <meshBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.85} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── SOLID CORE ─────────────────────────────────────────────────────────────
// A solid white sphere inside to give it volume, catch light, and block back-dots.
function SolidCore() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.99, 64, 64]} />
      <meshStandardMaterial 
        color="#ffffff" 
        roughness={0.9} 
        metalness={0.1} 
      />
    </mesh>
  );
}

// ─── ROTATING GLOBE GROUP ────────────────────────────────────────────────────
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015; // Smooth, slow elegant rotation
    }
  });

  return (
    <group ref={groupRef}>
      <SolidCore />
      <PointGlobeMesh />
    </group>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45, near: 0.01, far: 10 }}
        dpr={[1, 2]} // High DPI for retina displays
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          alpha: true 
        }}
        style={{ background: "transparent", cursor: "grab" }}
      >
        {/* Fog creates the beautiful depth effect fading into the background */}
        <fog attach="fog" args={[BG_COLOR, 1.8, 3.8]} />

        {/* Elegant lighting setup to give the white core soft volume */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight position={[5, 5, 4]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#f1f5f9" />

        <group rotation={[0.2, -0.4, 0]}>
          <RotatingGlobeGroup />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
