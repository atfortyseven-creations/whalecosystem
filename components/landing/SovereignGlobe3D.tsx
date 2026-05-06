"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — High-Fidelity Continental Dot Sphere ──────────────────
// Fibonacci sphere filtered against an earth land mask.
// Multiple CORS-safe texture fallbacks to guarantee land detection works.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 60000;
const GLOBE_RADIUS = 1.0;
const BG_COLOR = "#FAF9F6";
const DOT_COLOR = "#3F3F46";
const DOT_SIZE = 0.005;

// CORS-safe land mask URLs (tried in order until one loads successfully).
// The specular map has bright oceans (R≈255) and dark land (R≈0).
const TEXTURE_CANDIDATES = [
  "/earth_specular.jpg",                                                                // Local public/ (fastest, no CORS)
  "https://unpkg.com/three@0.160.0/examples/textures/planets/earth_specular_2048.jpg", // unpkg CDN
  "https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/textures/planets/earth_specular_2048.jpg",
];

// ─── VISITOR COUNTRIES — lat/lon/scale for every region ──────────────────────
const VISITOR_COUNTRIES = [
  // Europe
  { lat: 40.4,  lon: -3.7,   scale: 2.1 }, // Spain
  { lat: 52.4,  lon: 4.9,    scale: 1.4 }, // Netherlands
  { lat: 51.2,  lon: 10.4,   scale: 1.6 }, // Germany
  { lat: 46.2,  lon: 2.2,    scale: 1.5 }, // France
  { lat: 51.5,  lon: -0.1,   scale: 1.7 }, // UK
  { lat: 41.9,  lon: 12.5,   scale: 1.2 }, // Italy
  { lat: 46.8,  lon: 8.2,    scale: 1.0 }, // Switzerland
  { lat: 59.3,  lon: 18.1,   scale: 0.9 }, // Sweden
  { lat: 52.2,  lon: 21.0,   scale: 0.8 }, // Poland
  { lat: 38.7,  lon: -9.1,   scale: 0.9 }, // Portugal
  { lat: 50.8,  lon: 4.4,    scale: 0.9 }, // Belgium
  { lat: 48.2,  lon: 16.4,   scale: 0.8 }, // Austria
  { lat: 55.7,  lon: 12.6,   scale: 0.8 }, // Denmark
  { lat: 60.2,  lon: 24.9,   scale: 0.7 }, // Finland
  { lat: 50.1,  lon: 14.4,   scale: 0.7 }, // Czech Republic
  { lat: 44.4,  lon: 26.1,   scale: 0.7 }, // Romania
  { lat: 37.9,  lon: 23.7,   scale: 0.7 }, // Greece
  { lat: 50.4,  lon: 30.5,   scale: 0.7 }, // Ukraine
  { lat: 61.5,  lon: 105.3,  scale: 1.8 }, // Russia
  // Americas
  { lat: 37.1,  lon: -95.7,  scale: 2.5 }, // United States
  { lat: 40.7,  lon: -74.0,  scale: 1.8 }, // New York
  { lat: 37.8,  lon: -122.4, scale: 1.4 }, // San Francisco
  { lat: 56.1,  lon: -106.3, scale: 1.3 }, // Canada
  { lat: -14.2, lon: -51.9,  scale: 1.8 }, // Brazil
  { lat: 23.6,  lon: -102.5, scale: 1.4 }, // Mexico
  { lat: -38.4, lon: -63.6,  scale: 1.1 }, // Argentina
  { lat: 4.6,   lon: -74.1,  scale: 0.9 }, // Colombia
  { lat: -9.2,  lon: -75.0,  scale: 0.8 }, // Peru
  // Asia-Pacific
  { lat: 35.7,  lon: 139.7,  scale: 1.9 }, // Tokyo
  { lat: 35.9,  lon: 127.8,  scale: 1.5 }, // South Korea
  { lat: 35.9,  lon: 104.2,  scale: 2.2 }, // China
  { lat: 20.6,  lon: 79.0,   scale: 2.0 }, // India
  { lat: 1.3,   lon: 103.8,  scale: 1.3 }, // Singapore
  { lat: 22.3,  lon: 114.2,  scale: 1.2 }, // Hong Kong
  { lat: -25.3, lon: 133.8,  scale: 1.6 }, // Australia
  { lat: 15.9,  lon: 100.9,  scale: 0.9 }, // Thailand
  { lat: 14.1,  lon: 108.3,  scale: 0.9 }, // Vietnam
  { lat: 4.2,   lon: 108.0,  scale: 0.9 }, // Malaysia
  // Middle East & Africa
  { lat: 23.4,  lon: 53.8,   scale: 1.3 }, // UAE
  { lat: 38.9,  lon: 35.2,   scale: 1.1 }, // Turkey
  { lat: 23.9,  lon: 45.1,   scale: 1.1 }, // Saudi Arabia
  { lat: 25.2,  lon: 55.3,   scale: 1.0 }, // Dubai
  { lat: 31.0,  lon: 34.9,   scale: 0.9 }, // Israel
  { lat: -30.6, lon: 22.9,   scale: 1.0 }, // South Africa
  { lat: 9.1,   lon: 8.7,    scale: 1.0 }, // Nigeria
  { lat: 26.8,  lon: 30.8,   scale: 0.9 }, // Egypt
];

// ─── CONTINENTAL DOT MESH ─────────────────────────────────────────────────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(DOT_COLOR), []);
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [ready, setReady] = useState(false);

  // Try each texture URL in sequence until one loads
  useEffect(() => {
    let cancelled = false;

    const tryLoad = (urls: string[], index: number) => {
      if (index >= urls.length) {
        // All failed — render full sphere (better than blank)
        if (!cancelled) setReady(true);
        return;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = urls[index];

      img.onload = () => {
        if (cancelled) return;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("no ctx");
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, img.width, img.height);
          setPixelData(data.data);
          setImageWidth(img.width);
          setImageHeight(img.height);
          setReady(true);
        } catch {
          tryLoad(urls, index + 1);
        }
      };

      img.onerror = () => tryLoad(urls, index + 1);
    };

    tryLoad(TEXTURE_CANDIDATES, 0);
    return () => { cancelled = true; };
  }, []);

  // Build Fibonacci sphere filtered to land pixels
  useEffect(() => {
    if (!meshRef.current || !ready) return;

    const PHI = Math.PI * (3 - Math.sqrt(5));
    let validIndex = 0;

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let isLand = true; // fallback when no texture

      if (pixelData && imageWidth > 0) {
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI;
        const px = Math.min(imageWidth - 1, Math.floor(u * imageWidth));
        const py = Math.min(imageHeight - 1, Math.floor(v * imageHeight));
        const rVal = pixelData[(py * imageWidth + px) * 4];
        // Specular map: ocean = bright (R > 100), land = dark (R < 50)
        isLand = rVal < 100;
      }

      if (isLand) {
        dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
        dummy.lookAt(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(validIndex, dummy.matrix);
        meshRef.current.setColorAt(validIndex, color);
        validIndex++;
      }
    }

    // Zero out unused instances
    for (let i = validIndex; i < POINT_COUNT; i++) {
      dummy.position.set(0, 0, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.count = POINT_COUNT;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [ready, pixelData, imageWidth, imageHeight, dummy, color]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      <circleGeometry args={[DOT_SIZE, 8]} />
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

// ─── VISITOR MARKERS — Neon cyan pulsing spheres per country ─────────────────
function VisitorMarkers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const markerColor = useMemo(() => new THREE.Color("#22D3EE"), []);

  useEffect(() => {
    if (!meshRef.current) return;
    VISITOR_COUNTRIES.forEach((c, i) => {
      const latR = c.lat * (Math.PI / 180);
      const lonR = c.lon * (Math.PI / 180);
      const x = GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR);
      const y = GLOBE_RADIUS * Math.sin(latR);
      const z = GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR);
      dummy.position.set(x * 1.022, y * 1.022, z * 1.022);
      dummy.scale.setScalar(c.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.count = VISITOR_COUNTRIES.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    VISITOR_COUNTRIES.forEach((c, i) => {
      const latR = c.lat * (Math.PI / 180);
      const lonR = c.lon * (Math.PI / 180);
      const x = GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR);
      const y = GLOBE_RADIUS * Math.sin(latR);
      const z = GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR);
      const pulse = 1 + Math.sin(t * 2.5 + i * 0.8) * 0.35;
      dummy.position.set(x * 1.022, y * 1.022, z * 1.022);
      dummy.scale.setScalar(c.scale * pulse); // scale drives size; geometry radius is 0.009
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VISITOR_COUNTRIES.length]}>
      <sphereGeometry args={[0.009, 16, 16]} />
      <meshBasicMaterial color="#22D3EE" transparent opacity={0.9} />
    </instancedMesh>
  );
}

// ─── SOLID CORE ───────────────────────────────────────────────────────────────
function SolidCore() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.985, 64, 64]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// ─── ROTATING GLOBE GROUP ─────────────────────────────────────────────────────
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.001; });
  return (
    <group ref={groupRef}>
      <SolidCore />
      <PointGlobeMesh />
      <VisitorMarkers />
    </group>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45, near: 0.01, far: 10 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        style={{ background: "transparent", cursor: "grab" }}
      >
        <fog attach="fog" args={[BG_COLOR, 1.8, 3.8]} />
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
