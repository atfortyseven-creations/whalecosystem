"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── GLOBE — High-Fidelity Continental Dot Sphere ────────────────────────────
// Uses an internal geographic bounding-box land mask (no external files needed).
// Each entry: [latMin, latMax, lonMin, lonMax]
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 60000;
const GLOBE_RADIUS = 1.0;
const BG_COLOR = "#FAF9F6";
const DOT_COLOR = "#3F3F46";
const DOT_SIZE = 0.005;

// ─── LAND BOUNDING BOXES — simplified continental polygons ───────────────────
// Each row: [latMin, latMax, lonMin, lonMax]
// Multiple rows per continent to approximate irregular coastlines.
const LAND_BOXES: [number, number, number, number][] = [
  // ── NORTH AMERICA ──────────────────────────────────────────────────────────
  [25, 70, -170, -50],    // mainland
  [15, 30, -120, -80],    // Mexico / Central Am.
  [5,  20, -90,  -65],    // Central America
  [10, 25, -85,  -60],    // Caribbean coast
  [55, 72, -170, -120],   // Alaska
  // ── SOUTH AMERICA ──────────────────────────────────────────────────────────
  [-55, 13, -82, -34],    // full mainland
  [-5,  10, -82, -60],    // broad equatorial
  // ── EUROPE ─────────────────────────────────────────────────────────────────
  [36, 60, -10, 30],      // W + Central Europe
  [60, 71, 5,   30],      // Scandinavia
  [60, 71, -25, 5],       // Iceland / Faroe area (approx)
  [36, 42, 26,  45],      // Turkey / Caucasus
  [40, 60, 30,  60],      // Eastern Europe / W Russia
  // ── AFRICA ─────────────────────────────────────────────────────────────────
  [-35, 37, -18, 52],     // full mainland
  [-25, -10, 42, 52],     // Horn / east coast
  // ── ASIA ───────────────────────────────────────────────────────────────────
  [5,  75, 26,  180],     // broad Asia
  [1,  10, 100, 120],     // SE Asia peninsula
  [-8, 6,  95,  141],     // Indonesia / Malaysia (approx)
  [25, 55, 100, 145],     // China / Japan
  [30, 50, 40,  75],      // Middle East / Central Asia
  [55, 75, 60,  180],     // Siberia
  [20, 40, 55,  80],      // Indian subcontinent W
  [8,  28, 70,  100],     // Indian subcontinent E
  // ── OCEANIA ────────────────────────────────────────────────────────────────
  [-44, -10, 112, 155],   // Australia
  [-47, -34, 165, 178],   // New Zealand S
  [-34, -34, 172, 178],   // New Zealand N
  [-10, 0,   141, 160],   // Papua New Guinea
  // ── GREENLAND ──────────────────────────────────────────────────────────────
  [60, 84, -55, -15],
  // ── ANTARCTICA ─────────────────────────────────────────────────────────────
  [-90, -65, -180, 180],
];

/** Returns true if (lat, lon) falls inside any land bounding box */
function isLand(latDeg: number, lonDeg: number): boolean {
  for (const [latMin, latMax, lonMin, lonMax] of LAND_BOXES) {
    if (latDeg >= latMin && latDeg <= latMax && lonDeg >= lonMin && lonDeg <= lonMax) {
      return true;
    }
  }
  return false;
}

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

  useEffect(() => {
    if (!meshRef.current) return;

    const PHI = Math.PI * (3 - Math.sqrt(5));
    let validIndex = 0;

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;          // [-1, +1]
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Convert Cartesian → geographic coordinates
      const latDeg = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI);
      const lonDeg = Math.atan2(z, x) * (180 / Math.PI);

      if (!isLand(latDeg, lonDeg)) continue;

      dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(validIndex, dummy.matrix);
      meshRef.current.setColorAt(validIndex, color);
      validIndex++;
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
  }, [dummy, color]);

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
      dummy.scale.setScalar(c.scale * pulse);
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
