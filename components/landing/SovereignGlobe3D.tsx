"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — High-Fidelity Light-Mode Dot Sphere ───────────────────
// Perfectly crafted Fibonacci sphere using NASA's Blue Marble topology mask.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 45_000; 
const GLOBE_RADIUS = 1.0;

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 }
];

function PointGlobeMesh({ isDragging }: { isDragging: React.MutableRefObject<boolean> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Track states for animation
  const isLand = useRef<boolean[]>(new Array(POINT_COUNT).fill(false));
  const isReady = useRef(false);
  const flash = useRef<number[]>(new Array(POINT_COUNT).fill(0));

  // Colors aligned with light-mode minimalist aesthetic
  const landColor = useMemo(() => new THREE.Color("#ffffff"), []); // White for land
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

    // Random transactional flashes on land coordinates
    const land = isLand.current;
    const fl = flash.current;
    
    // Trigger new flashes only when dragging
    if (isDragging.current) {
      for (let k = 0; k < 6; k++) {
        const r = Math.floor(Math.random() * POINT_COUNT);
        if (land[r]) fl[r] = 1.0; // max intensity
      }
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
        Optimized polygon count for mobile/unplugged hardware.
        Increased size slightly to compensate for lower density.
      */}
      <circleGeometry args={[0.016, 16]} />
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

// ─── CITY MARKERS ────────────────────────────────────────────────────────────
// High-visibility red markers for key financial hubs
function CityMarkers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    CITIES.forEach((city, i) => {
      const latRad = (city.lat * Math.PI) / 180;
      // Adjusting longitude offset: standard geographic mapping
      // The topological map aligns Greenwich to longitude 0.
      // But notice: Math.atan2(z, x) is the angle in the X-Z plane.
      // The Earth texture typically maps the center to lon 0, lat 0.
      // In 3D space, Z is forward/backward. For standard Earth meshes, if lon=0 is at +X (which maps to u=0.5 if u = 0.5 + lon/2PI), then:
      // In three.js, we must use negative longitude because of the orientation of the Z axis to get it correct with the projection.
      // Let's rely on standard mapping: x = r * cos(lon), z = r * sin(lon)
      const lonRad = (city.lon * Math.PI) / 180;

      const y = Math.sin(latRad);
      const r = Math.cos(latRad);
      const x = r * Math.cos(lonRad);
      const z = r * Math.sin(lonRad);

      const R = GLOBE_RADIUS * 1.002; // Very slightly raised
      dummy.position.set(x * R, y * R, z * R);
      
      // We want the circle to be perfectly flat on the surface
      const normal = dummy.position.clone().normalize();
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      
      dummy.scale.setScalar(0.025); // Large enough to be visible
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color("#ff0000")); // Red
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CITIES.length]}>
      <circleGeometry args={[1, 16]} />
      <meshBasicMaterial 
        vertexColors 
        transparent 
        opacity={1.0} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── ROTATING GLOBE GROUP ────────────────────────────────────────────────────
function RotatingGlobeGroup({ isDragging }: { isDragging: React.MutableRefObject<boolean> }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0006;
  });

  return (
    <group ref={groupRef}>
      <GlobeHalo />
      <PointGlobeMesh isDragging={isDragging} />
      <CityMarkers />
    </group>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  const isDragging = useRef(false);

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
          <RotatingGlobeGroup isDragging={isDragging} />
        </group>

        <OrbitControls
          onStart={() => isDragging.current = true}
          onEnd={() => isDragging.current = false}
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
