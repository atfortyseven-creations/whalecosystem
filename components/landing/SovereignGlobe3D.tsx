"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — High-Fidelity Light-Mode Dot Sphere ───────────────────
// Perfectly crafted Fibonacci sphere using NASA's Blue Marble topology mask.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 150_000; 
const GLOBE_RADIUS = 1.0;

function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Track states for animation
  const isLand = useRef<boolean[]>(new Array(POINT_COUNT).fill(false));
  const isReady = useRef(false);
  const flash = useRef<number[]>(new Array(POINT_COUNT).fill(0));

  // Colors aligned with light-mode minimalist aesthetic
  const landColor = useMemo(() => new THREE.Color("#1f2937"), []); // Dark gray/black for land
  const oceanColor = useMemo(() => new THREE.Color("#f3f4f6"), []); // Faint gray for ocean
  const flashColor = useMemo(() => new THREE.Color("#6366f1"), []); // Deep purple/indigo for activity
  const tmp = useMemo(() => new THREE.Color(), []);

  // 1) Initialize sphere immediately with perfect geometry
  useEffect(() => {
    if (!meshRef.current) return;
    
    const PHI = Math.PI * (3 - Math.sqrt(5));
    
    // Initial fast layout — render everything as faint ocean until topology loads
    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      
      dummy.position.set(
        Math.cos(theta) * r * GLOBE_RADIUS,
        y * GLOBE_RADIUS,
        Math.sin(theta) * r * GLOBE_RADIUS
      );
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(0.2); // Tiny dots initially
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, oceanColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // 2) Load Topography Mask safely with robust CORS proxy fallbacks
    const loadTopology = async () => {
      // Multiple sources for absolute redundancy
      const sources = [
        "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png",
        "https://cdn.jsdelivr.net/gh/vasturiano/three-globe/example/img/earth-topology.png",
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
      ];

      for (const src of sources) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const W = img.naturalWidth;
              const H = img.naturalHeight;
              const cvs = document.createElement("canvas");
              cvs.width = W;
              cvs.height = H;
              const ctx = cvs.getContext("2d", { willReadFrequently: true });
              if (!ctx) return reject("No canvas ctx");
              
              ctx.drawImage(img, 0, 0);
              const data = ctx.getImageData(0, 0, W, H).data;

              // Apply the mask mapping
              for (let i = 0; i < POINT_COUNT; i++) {
                const yN = 1 - (i / (POINT_COUNT - 1)) * 2;
                const rN = Math.sqrt(Math.max(0, 1 - yN * yN));
                const theta = PHI * i;
                const xN = Math.cos(theta) * rN;
                const zN = Math.sin(theta) * rN;

                const lat = Math.asin(yN);                  
                const lon = Math.atan2(zN, xN);             
                const u = 0.5 + lon / (2 * Math.PI);      
                const v = 0.5 - lat / Math.PI;            

                const px = Math.min(Math.floor(u * W), W - 1);
                const py = Math.min(Math.floor(v * H), H - 1);
                const idx = (py * W + px) * 4;

                // Dark pixels in the topology map are land elevation
                const isLandPixel = data[idx] < 90;
                isLand.current[i] = isLandPixel;

                dummy.position.set(xN * GLOBE_RADIUS, yN * GLOBE_RADIUS, zN * GLOBE_RADIUS);
                dummy.lookAt(0, 0, 0);
                
                // Land gets full size, ocean shrinks to tiny invisible dots
                dummy.scale.setScalar(isLandPixel ? 1.0 : 0.0); 
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(i, dummy.matrix);
                if (isLandPixel) {
                  meshRef.current.setColorAt!(i, landColor);
                }
              }

              meshRef.current.instanceMatrix.needsUpdate = true;
              if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
              isReady.current = true;
              resolve();
            };
            img.onerror = reject;
            img.src = src;
          });

          // If successful, break out of loop
          if (isReady.current) break;
        } catch (e) {
          console.warn(`[SovereignGlobe] Source failed: ${src}`);
        }
      }
    };

    loadTopology();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) Animation Loop: Smooth rotation & institutional network flashes
  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m || !isReady.current) return;

    // Elegant, slow rotation
    m.rotation.y += 0.0006;

    // Random transactional flashes on land coordinates
    const land = isLand.current;
    const fl = flash.current;
    
    // Trigger new flashes (institutional volume simulation)
    for (let k = 0; k < 6; k++) {
      const r = Math.floor(Math.random() * POINT_COUNT);
      if (land[r]) fl[r] = 1.0; // max intensity
    }

    let dirty = false;
    for (let i = 0; i < POINT_COUNT; i++) {
      if (fl[i] > 0) {
        // Smooth decay
        fl[i] = Math.max(0, fl[i] - delta * 1.5);
        // Interpolate between dark land and the purple flash
        tmp.lerpColors(landColor, flashColor, fl[i]);
        m.setColorAt(i, tmp);
        dirty = true;
      }
    }
    
    if (dirty && m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      {/* 
        Perfect circles (32 segments) ensure no "blocky" or "hexagonal" artifacts.
        Scale 0.010 is ultra-fine for institutional clarity.
      */}
      <circleGeometry args={[0.010, 32]} />
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

// ─── AMBIENT HALO ─────────────────────────────────────────────────────────────
// Soft glow behind the globe to give it volumetric presence
function GlobeHalo() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + 0.01 * Math.sin(clock.elapsedTime);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.03, 64, 64]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden">
      
      {/* Subdued volumetric background glow (light mode optimized) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(40px)"
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45, near: 0.01, far: 100 }}
        dpr={[1, 2]} // High DPI for retina displays
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          alpha: true 
        }}
        style={{ background: "transparent", cursor: "grab" }}
      >
        <ambientLight intensity={1.0} color="#ffffff" />

        {/* 
          Elegant tilt: Southward offset to feature northern hemisphere
          and add 3D depth to the rotation axis
        */}
        <group rotation={[0.25, -0.5, 0]}>
          <GlobeHalo />
          <PointGlobeMesh />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          autoRotate={true}
          autoRotateSpeed={0.6}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
