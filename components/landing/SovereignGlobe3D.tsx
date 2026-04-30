"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── 1. DOT GLOBE (PERFECT SILHOUETTES WITH EARTH MASK) ──────────────────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  // 18,000 points guarantees maximum perfection and ultra-crisp borders
  const count = 18000; 
  const radius = 100;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  useEffect(() => {
    if (!meshRef.current) return;

    // 1. SYNC: Compute exact positions immediately so the globe is visible instantly.
    const phiAngle = Math.PI * (3 - Math.sqrt(5)); 
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; 
      const r = Math.sqrt(1 - y * y); 
      
      const theta = phiAngle * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      dummy.position.set(x * radius, y * radius, z * radius);
      dummy.lookAt(0, 0, 0); 
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Default color before texture loads
      color.set("#A0A0A0");
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

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
            
            if (isWater) {
              color.set("#3B82F6"); // Blue for water
            } else {
              color.set("#6D28D9"); // Purple for continents
            }
            
            meshRef.current.setColorAt(i, color);
          }
          
          if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
          }
          URL.revokeObjectURL(imgUrl);
        };
        img.onerror = () => console.error("[SovereignGlobe] Image failed to load.");
      } catch (e) {
        console.error("[SovereignGlobe] Failed to map continent data", e);
      }
    };

    loadGlobeData();
  }, [count, dummy, color]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Idle elegance
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Tiny circle for high resolution */}
      <circleGeometry args={[0.25, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── 2. PULSING HOTSPOTS (NO ARCS) ───────────────────────────────────────────
function Hotspot({ lat, lng, radius, activityLevel }: { lat: number, lng: number, radius: number, activityLevel: number }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const pos = new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );

  const meshRef = useRef<THREE.Mesh>(null!);
  const [offset] = useState(() => Math.random() * 100);

  // Activity logic: more activity = faster blink and larger base scale
  const speed = 2 + activityLevel * 1.5;
  const baseScale = 1.0 + activityLevel * 0.15;

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed + offset;
      const s = baseScale + Math.sin(t) * (0.3 + activityLevel * 0.05);
      meshRef.current.scale.set(s, s, s);
      
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.abs(Math.sin(t)) * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[1.2, 16, 16]} />
      {/* Golden pulsing hotspots for Bitcoin activity */}
      <meshBasicMaterial color="#D4AF37" transparent opacity={0.8} />
    </mesh>
  );
}

// ─── 3. MAIN GLOBE COMPONENT ────────────────────────────────────────────────
export function SovereignGlobe3D() {
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    // Hardcoded major global economic nodes. 
    // Activity scale 1 (lowest) to 10 (highest).
    const locations = [
      { lat: 40.71, lng: -74.00, activity: 9 }, // New York
      { lat: 51.50, lng: -0.12, activity: 8 },  // London
      { lat: 35.68, lng: 139.76, activity: 10 },// Tokyo
      { lat: 1.35, lng: 103.81, activity: 7 },  // Singapore
      { lat: 25.20, lng: 55.27, activity: 8 },  // Dubai
      { lat: 22.31, lng: 114.16, activity: 6 }, // Hong Kong
      { lat: 48.85, lng: 2.35, activity: 5 },   // Paris
      { lat: 37.77, lng: -122.41, activity: 9 },// San Francisco
      { lat: -33.86, lng: 151.20, activity: 4 },// Sydney
      { lat: -23.55, lng: -46.63, activity: 5 },// Sao Paulo
      { lat: 50.11, lng: 8.68, activity: 7 },   // Frankfurt
      { lat: 39.90, lng: 116.40, activity: 6 }, // Beijing
    ];
    setHotspots(locations);
  }, []);

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 z-0 bg-[#FAFAFA]">
      <Canvas
        camera={{ position: [0, 0, 240], fov: 45, near: 1, far: 2000 }}
        dpr={[1, 2]} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: false 
        }}
      >
        <color attach="background" args={['#FAFAFA']} />
        <ambientLight intensity={1.5} color="#ffffff" />

        <group rotation={[0.2, 0, 0]}>
          <PointGlobeMesh />
          
          {hotspots.map((spot, i) => (
            <Hotspot key={i} lat={spot.lat} lng={spot.lng} radius={101} activityLevel={spot.activity} />
          ))}
        </group>

        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
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
