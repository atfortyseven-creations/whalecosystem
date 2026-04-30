"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── 1. DOT GLOBE (PERFECT SILHOUETTES WITH EARTH MASK) ──────────────────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  // 35,000 points guarantees maximum perfection and ultra-crisp borders (inhuman density)
  const count = 35000; 
  const radius = 100;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  // Store the base state of each point
  const isLandRef = useRef<boolean[]>(new Array(count).fill(false));
  const flashIntensityRef = useRef<number[]>(new Array(count).fill(0));

  useEffect(() => {
    if (!meshRef.current) return;

    // 1. SYNC: Compute exact positions immediately
    const phiAngle = Math.PI * (3 - Math.sqrt(5)); 
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; 
      const r = Math.sqrt(1 - y * y); 
      const theta = phiAngle * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      dummy.position.set(x * radius, y * radius, z * radius);
      dummy.lookAt(0, 0, 0); 
      
      // Initially scale to 0 (invisible) until mask loads
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color.set("#111111"));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // 2. ASYNC: Map precise continent silhouettes using Earth mask
    const loadGlobeData = async () => {
      try {
        const response = await fetch('https://unpkg.com/three-globe/example/img/earth-water.png');
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

          for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; 
            const r = Math.sqrt(1 - y * y); 
            const theta = phiAngle * i;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            
            // Compute precise UV coordinates
            const lat = Math.asin(y); 
            const lon = Math.atan2(z, x); 
            
            const u = 0.5 + (lon / (2 * Math.PI));
            const v = 0.5 - (lat / Math.PI);
            
            const px = Math.floor(u * img.width);
            const py = Math.floor(v * img.height);
            const safePx = Math.max(0, Math.min(px, img.width - 1));
            const safePy = Math.max(0, Math.min(py, img.height - 1));
            
            const pixelIdx = (safePy * img.width + safePx) * 4;
            
            // In earth-water.png, white pixels (255) are water, black pixels (0) are land.
            const isWater = imgData[pixelIdx] > 128;
            
            dummy.position.set(x * radius, y * radius, z * radius);
            dummy.lookAt(0, 0, 0);

            if (isWater) {
              isLandRef.current[i] = false;
              dummy.scale.set(0, 0, 0); // Hide water completely to form the exact continent silhouette
            } else {
              isLandRef.current[i] = true;
              dummy.scale.set(1, 1, 1);
              color.set("#111111"); // Absolute black/dark dots for land
              meshRef.current.setColorAt(i, color);
            }
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
          }
          
          meshRef.current.instanceMatrix.needsUpdate = true;
          if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
          }
          URL.revokeObjectURL(imgUrl);
        };
      } catch (e) {
        console.error("[SovereignGlobe] Failed to map continent data", e);
      }
    };

    loadGlobeData();
  }, [count, dummy, color]);

  // 3. REAL-TIME TRANSACTION FLASHES
  // Inhuman perfection: flash random land points to simulate global transactions
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.y += 0.0005; // Idle elegance rotation

    const landArray = isLandRef.current;
    const flashes = flashIntensityRef.current;
    let colorUpdated = false;

    // 1. Trigger new transactions (flashes)
    // About 10 new transactions per frame across the globe
    for (let i = 0; i < 15; i++) {
        const randomIdx = Math.floor(Math.random() * count);
        if (landArray[randomIdx]) {
            flashes[randomIdx] = 1.0; // Max intensity
        }
    }

    // 2. Decay existing flashes and update colors
    // Aztec Theme: Base #111111 (Black/Dark), Peak #00C076 (Emerald Green)
    const baseColor = new THREE.Color("#111111");
    const peakColor = new THREE.Color("#00C076");
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
        if (flashes[i] > 0) {
            flashes[i] -= delta * 2.0; // Decay speed
            if (flashes[i] < 0) flashes[i] = 0;

            // Interpolate between base dark and peak emerald based on intensity
            tempColor.lerpColors(baseColor, peakColor, flashes[i]);
            meshRef.current.setColorAt(i, tempColor);
            colorUpdated = true;
        }
    }

    if (colorUpdated && meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Tiny circle for high resolution */}
      <circleGeometry args={[0.2, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── 3. MAIN GLOBE COMPONENT ────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 z-0 bg-[#050505]">
      {/* Volumetric ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00C076]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 240], fov: 45, near: 1, far: 2000 }}
        dpr={[1, 2]} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: true 
        }}
      >
        <ambientLight intensity={1.5} color="#ffffff" />

        <group rotation={[0.2, -0.5, 0]}>
          <PointGlobeMesh />
        </group>

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minDistance={120} 
          maxDistance={400}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
