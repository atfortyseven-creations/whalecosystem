"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — High-Fidelity Continental Dot Sphere ──────────────────
// Maps a world topology image to an offscreen canvas and filters Fibonacci
// sphere points to only render on continents. Anti-aliased 4-sample lookup.
// Visitor country markers with neon pulse + animated data flow particles.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 150000; // Maximum density for absolute continent perfection
const GLOBE_RADIUS = 1.0;
const BG_COLOR = "#FAF9F6";
const DOT_COLOR = "#3F3F46";
const DOT_SIZE = 0.004;

const EARTH_SPECULAR_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg";

// ─── VISITOR COUNTRIES — All nations with lat/lon + relative traffic scale ───
const VISITOR_COUNTRIES = [
  // Europe
  { name: "Spain",           lat: 40.4,  lon: -3.7,   scale: 2.1 },
  { name: "Netherlands",     lat: 52.4,  lon: 4.9,    scale: 1.4 },
  { name: "Germany",         lat: 51.2,  lon: 10.4,   scale: 1.6 },
  { name: "France",          lat: 46.2,  lon: 2.2,    scale: 1.5 },
  { name: "United Kingdom",  lat: 51.5,  lon: -0.1,   scale: 1.7 },
  { name: "Italy",           lat: 41.9,  lon: 12.5,   scale: 1.2 },
  { name: "Switzerland",     lat: 46.8,  lon: 8.2,    scale: 1.0 },
  { name: "Sweden",          lat: 59.3,  lon: 18.1,   scale: 0.9 },
  { name: "Norway",          lat: 59.9,  lon: 10.7,   scale: 0.8 },
  { name: "Poland",          lat: 52.2,  lon: 21.0,   scale: 0.8 },
  { name: "Portugal",        lat: 38.7,  lon: -9.1,   scale: 0.9 },
  { name: "Belgium",         lat: 50.8,  lon: 4.4,    scale: 0.9 },
  { name: "Austria",         lat: 48.2,  lon: 16.4,   scale: 0.8 },
  { name: "Denmark",         lat: 55.7,  lon: 12.6,   scale: 0.8 },
  { name: "Finland",         lat: 60.2,  lon: 24.9,   scale: 0.7 },
  { name: "Czech Republic",  lat: 50.1,  lon: 14.4,   scale: 0.7 },
  { name: "Romania",         lat: 44.4,  lon: 26.1,   scale: 0.7 },
  { name: "Greece",          lat: 37.9,  lon: 23.7,   scale: 0.7 },
  { name: "Hungary",         lat: 47.5,  lon: 19.0,   scale: 0.6 },
  { name: "Ukraine",         lat: 50.4,  lon: 30.5,   scale: 0.7 },
  // Americas
  { name: "United States",   lat: 37.1,  lon: -95.7,  scale: 2.5 },
  { name: "Canada",          lat: 56.1,  lon: -106.3, scale: 1.3 },
  { name: "Brazil",          lat: -14.2, lon: -51.9,  scale: 1.8 },
  { name: "Mexico",          lat: 23.6,  lon: -102.5, scale: 1.4 },
  { name: "Argentina",       lat: -38.4, lon: -63.6,  scale: 1.1 },
  { name: "Colombia",        lat: 4.6,   lon: -74.1,  scale: 0.9 },
  { name: "Chile",           lat: -35.7, lon: -71.5,  scale: 0.9 },
  { name: "Peru",            lat: -9.2,  lon: -75.0,  scale: 0.8 },
  { name: "Venezuela",       lat: 6.4,   lon: -66.6,  scale: 0.7 },
  { name: "Ecuador",         lat: -1.8,  lon: -78.2,  scale: 0.7 },
  { name: "Uruguay",         lat: -32.5, lon: -55.8,  scale: 0.6 },
  { name: "Paraguay",        lat: -23.4, lon: -58.4,  scale: 0.5 },
  { name: "Bolivia",         lat: -16.3, lon: -63.6,  scale: 0.6 },
  // Asia-Pacific
  { name: "Japan",           lat: 36.2,  lon: 138.3,  scale: 1.9 },
  { name: "South Korea",     lat: 35.9,  lon: 127.8,  scale: 1.5 },
  { name: "China",           lat: 35.9,  lon: 104.2,  scale: 2.2 },
  { name: "India",           lat: 20.6,  lon: 79.0,   scale: 2.0 },
  { name: "Singapore",       lat: 1.3,   lon: 103.8,  scale: 1.3 },
  { name: "Hong Kong",       lat: 22.3,  lon: 114.2,  scale: 1.2 },
  { name: "Australia",       lat: -25.3, lon: 133.8,  scale: 1.6 },
  { name: "Indonesia",       lat: -0.8,  lon: 113.9,  scale: 1.1 },
  { name: "Thailand",        lat: 15.9,  lon: 100.9,  scale: 0.9 },
  { name: "Vietnam",         lat: 14.1,  lon: 108.3,  scale: 0.9 },
  { name: "Philippines",     lat: 12.9,  lon: 121.8,  scale: 0.9 },
  { name: "Malaysia",        lat: 4.2,   lon: 108.0,  scale: 0.9 },
  { name: "New Zealand",     lat: -40.9, lon: 174.9,  scale: 0.7 },
  { name: "Pakistan",        lat: 30.4,  lon: 69.3,   scale: 0.8 },
  { name: "Bangladesh",      lat: 23.7,  lon: 90.4,   scale: 0.7 },
  // Middle East & Africa
  { name: "UAE",             lat: 23.4,  lon: 53.8,   scale: 1.3 },
  { name: "Turkey",          lat: 38.9,  lon: 35.2,   scale: 1.1 },
  { name: "Saudi Arabia",    lat: 23.9,  lon: 45.1,   scale: 1.1 },
  { name: "Israel",          lat: 31.0,  lon: 34.9,   scale: 0.9 },
  { name: "South Africa",    lat: -30.6, lon: 22.9,   scale: 1.0 },
  { name: "Nigeria",         lat: 9.1,   lon: 8.7,    scale: 1.0 },
  { name: "Egypt",           lat: 26.8,  lon: 30.8,   scale: 0.9 },
  { name: "Kenya",           lat: -1.3,  lon: 36.8,   scale: 0.7 },
  { name: "Ghana",           lat: 7.9,   lon: -1.0,   scale: 0.6 },
  { name: "Ethiopia",        lat: 9.1,   lon: 40.5,   scale: 0.6 },
  { name: "Morocco",         lat: 31.8,  lon: -7.1,   scale: 0.7 },
  { name: "Algeria",         lat: 28.0,  lon: 2.6,    scale: 0.6 },
  { name: "Tanzania",        lat: -6.4,  lon: 34.9,   scale: 0.5 },
  { name: "Kazakhstan",      lat: 48.0,  lon: 66.9,   scale: 0.7 },
  { name: "Russia",          lat: 61.5,  lon: 105.3,  scale: 1.8 },
];

// ─── CONTINENTAL DOT MESH (Fibonacci + Anti-Aliased Pixel Sampling) ──────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(DOT_COLOR), []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = EARTH_SPECULAR_URL;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          setPixelData(imgData.data);
          setImageWidth(img.width);
          setImageHeight(img.height);
          setMapLoaded(true);
        } else {
          setMapLoaded(true);
        }
      } catch {
        setMapLoaded(true);
      }
    };

    img.onerror = () => setMapLoaded(true);
  }, []);

  useEffect(() => {
    if (!meshRef.current || !mapLoaded) return;

    const PHI = Math.PI * (3 - Math.sqrt(5));
    let validIndex = 0;

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let isLand = true;

      if (pixelData) {
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(y) / Math.PI;

        const px = Math.floor(u * imageWidth);
        const py = Math.floor(v * imageHeight);

        // ── 4-sample anti-aliased lookup (Grok's improvement) ─────────────
        let totalR = 0;
        let samples = 0;
        for (let dy = -1; dy <= 1; dy += 2) {
          for (let dx = -1; dx <= 1; dx += 2) {
            const sx = Math.max(0, Math.min(imageWidth - 1, px + dx));
            const sy = Math.max(0, Math.min(imageHeight - 1, py + dy));
            const idx = (sy * imageWidth + sx) * 4;
            totalR += pixelData[idx];
            samples++;
          }
        }
        if (totalR / samples >= 48) isLand = false;
      }

      if (isLand) {
        dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
        dummy.lookAt(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(validIndex, dummy.matrix);
        meshRef.current.setColorAt(validIndex, color);
        validIndex++;
      }
    }

    for (let i = validIndex; i < POINT_COUNT; i++) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.count = validIndex;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [mapLoaded, pixelData, imageWidth, imageHeight, dummy, color]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      <circleGeometry args={[DOT_SIZE, 8]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── VISITOR COUNTRY MARKERS — Neon Pulse ─────────────────────────────────────
function VisitorMarkers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const markerColor = useMemo(() => new THREE.Color("#22D3EE"), []);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!meshRef.current) return;
    let idx = 0;
    VISITOR_COUNTRIES.forEach((country) => {
      const latRad = country.lat * (Math.PI / 180);
      const lonRad = country.lon * (Math.PI / 180);

      const x = GLOBE_RADIUS * Math.cos(latRad) * Math.cos(lonRad);
      const y = GLOBE_RADIUS * Math.sin(latRad);
      const z = GLOBE_RADIUS * Math.cos(latRad) * Math.sin(lonRad);

      dummy.position.set(x * 1.022, y * 1.022, z * 1.022);
      dummy.scale.setScalar(0.009 * country.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(idx, dummy.matrix);
      meshRef.current.setColorAt(idx, markerColor);
      idx++;
    });

    meshRef.current.count = idx;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy, markerColor]);

  // Neon pulse at high frequency (240Hz ready)
  useFrame((state) => {
    if (!meshRef.current) return;
    timeRef.current = state.clock.getElapsedTime();

    VISITOR_COUNTRIES.forEach((c, i) => {
      const latRad = c.lat * (Math.PI / 180);
      const lonRad = c.lon * (Math.PI / 180);

      const x = GLOBE_RADIUS * Math.cos(latRad) * Math.cos(lonRad);
      const y = GLOBE_RADIUS * Math.sin(latRad);
      const z = GLOBE_RADIUS * Math.cos(latRad) * Math.sin(lonRad);

      const pulse = 1 + Math.sin(timeRef.current * 12 + i) * 0.25;
      dummy.position.set(x * 1.022, y * 1.022, z * 1.022);
      dummy.scale.setScalar(0.009 * c.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VISITOR_COUNTRIES.length]}>
      <sphereGeometry args={[0.009, 32, 32]} />
      <meshBasicMaterial
        color="#22D3EE"
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ─── DATA FLOW PARTICLES (Visual Innovation) ──────────────────────────────────
function DataFlowParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const particleCount = 180;
  const positions = useMemo(() => new Float32Array(particleCount * 3), []);
  const velocities = useMemo(() => new Float32Array(particleCount), []);

  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      const from = VISITOR_COUNTRIES[Math.floor(Math.random() * VISITOR_COUNTRIES.length)];
      const to = VISITOR_COUNTRIES[Math.floor(Math.random() * VISITOR_COUNTRIES.length)];

      const lat1 = from.lat * (Math.PI / 180);
      const lon1 = from.lon * (Math.PI / 180);
      const lat2 = to.lat * (Math.PI / 180);
      const lon2 = to.lon * (Math.PI / 180);

      const progress = Math.random();
      const x = GLOBE_RADIUS * Math.cos(lat1 + (lat2 - lat1) * progress) * Math.cos(lon1 + (lon2 - lon1) * progress);
      const y = GLOBE_RADIUS * Math.sin(lat1 + (lat2 - lat1) * progress);
      const z = GLOBE_RADIUS * Math.cos(lat1 + (lat2 - lat1) * progress) * Math.sin(lon1 + (lon2 - lon1) * progress);

      positions[i * 3]     = x * 1.03;
      positions[i * 3 + 1] = y * 1.03;
      positions[i * 3 + 2] = z * 1.03;
      velocities[i] = 0.8 + Math.random() * 1.2;
    }

    if (pointsRef.current) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      pointsRef.current.geometry = geometry;
    }
  }, [positions, velocities]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3]     *= 0.9995;
      posArray[i * 3 + 1] *= 0.9995;
      posArray[i * 3 + 2] *= 0.9995;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.0035}
        color="#67E8F9"
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

// ─── SOLID CORE ───────────────────────────────────────────────────────────────
function SolidCore() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.982, 128, 128]} />
      <meshStandardMaterial
        color="#FAF9F6"
        roughness={0.82}
        metalness={0.18}
        emissive="#E0F2FE"
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

// ─── ROTATING GLOBE GROUP ─────────────────────────────────────────────────────
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.00065;
  });

  return (
    <group ref={groupRef}>
      <SolidCore />
      <PointGlobeMesh />
      <VisitorMarkers />
      <DataFlowParticles />
    </group>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 2.72], fov: 40, near: 0.01, far: 10 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
        }}
        style={{ background: "transparent", cursor: "grab" }}
        frameloop="always"
      >
        <fog attach="fog" args={[BG_COLOR, 1.55, 3.95]} />

        <ambientLight intensity={0.85} color="#ffffff" />
        <directionalLight position={[7, 6, 6]} intensity={1.85} color="#ffffff" />
        <directionalLight position={[-7, -5, -7]} intensity={0.75} color="#bae6fd" />

        <group rotation={[0.18, -0.38, 0]}>
          <RotatingGlobeGroup />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.17}
          maxPolarAngle={Math.PI * 0.83}
          enableDamping
          dampingFactor={0.035}
        />
      </Canvas>
    </div>
  );
}
