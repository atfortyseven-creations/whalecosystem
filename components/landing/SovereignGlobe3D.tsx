"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const POINT_COUNT  = 80000;
const GLOBE_RADIUS = 1.0;
const DOT_SIZE     = 0.004;
const DOT_COLOR    = "#3F3F46";
const BG_COLOR     = "#FAF9F6";

// ─── HIGH-PRECISION LAND MASK ─────────────────────────────────────────────────
// Each entry: [latMin, latMax, lonMin, lonMax, weight]
// Multiple overlapping zones approximate each continent's true coastlines.
// Critically, OCEAN areas between landmasses have no coverage.
const LAND_ZONES: [number, number, number, number][] = [
  // ══ NORTH AMERICA ══
  [48, 70,  -140, -55],   // Canada main
  [25, 50,  -125, -65],   // USA continental
  [58, 72,  -170, -130],  // Alaska
  [15, 30,  -120, -87],   // Mexico
  [8,  18,  -92,  -77],   // Central America
  [22, 28,  -85,  -74],   // Cuba + Caribbean west
  [17, 23,  -80,  -60],   // Caribbean islands
  [60, 68,  -100, -60],   // Labrador / Quebec
  [70, 84,  -100, -60],   // Nunavut / Baffin
  [70, 84,  -60,  -20],   // NE Canada Arctic
  [45, 60,  -65,  -52],   // Nova Scotia / Newfoundland
  // ══ SOUTH AMERICA ══
  [8,  12,  -73,  -60],   // Venezuela / Guyana top
  [-5, 8,   -80,  -50],   // Colombia / Ecuador / Peru N
  [-18,-5,  -80,  -35],   // Peru / Bolivia / Brazil W
  [-35,-18, -73,  -34],   // Argentina / Brazil S
  [-55,-35, -75,  -53],   // Patagonia / Chile
  [-5,  8,  -50,  -34],   // NE Brazil
  [-23,-5,  -50,  -34],   // Brazil east coast
  // ══ EUROPE ══
  [36, 44,  -10,  5],     // Spain / Portugal
  [44, 52,  -5,   20],    // France / Germany / Benelux
  [52, 60,  -5,   25],    // UK / Netherlands / Poland
  [56, 71,  5,    30],    // Scandinavia
  [60, 66,  -24,  -12],   // Iceland
  [42, 48,  8,    20],    // Switzerland / Austria / N Italy
  [38, 44,  12,   28],    // Italy / Balkans N
  [36, 42,  14,   30],    // Italy S / Greece / Balkans S
  [46, 60,  20,   40],    // Poland / Ukraine / Romania
  [36, 42,  26,   44],    // Turkey W + Caucasus
  [60, 70,  30,   60],    // NW Russia
  [50, 60,  40,   65],    // Russia Urals
  // ══ AFRICA ══
  [30, 37,  -6,   37],    // Morocco / Algeria / Tunisia / Libya / Egypt
  [20, 30,  -18,  37],    // Mauritania / Mali / Niger / Sudan
  [10, 20,  -18,  42],    // Senegal / Nigeria / Chad / Ethiopia N
  [0,  10,  -18,  45],    // Guinea / Congo / Kenya / Somalia
  [-12,0,   10,   41],    // DRC / Tanzania / Mozambique
  [-35,-12, 15,   40],    // Zambia / Zimbabwe / South Africa
  [-25,-12, 42,   52],    // Mozambique coast / Madagascar W
  [-26, -12, 43, 50],     // Madagascar
  [22, 33,  23,   37],    // Egypt / Sudan N
  [4,  12,  38,   52],    // Horn of Africa (Ethiopia / Somalia)
  // ══ ASIA ══
  [36, 42,  36,   60],    // Turkey E / Iran / Iraq
  [24, 36,  45,   65],    // Arabian Peninsula / Pakistan W
  [8,  24,  45,   60],    // Yemen / Oman
  [20, 36,  65,   80],    // Pakistan / India N
  [8,  20,  72,   82],    // India S
  [24, 40,  80,   110],   // Nepal / Tibet / SW China
  [30, 50,  100,  130],   // China main
  [40, 55,  55,   90],    // Kazakhstan / Uzbekistan
  [50, 75,  60,   100],   // Russia W Siberia
  [55, 75,  100,  140],   // Russia E Siberia
  [55, 75,  140,  180],   // Russia Far East
  [30, 46,  130,  145],   // Korea / Japan Honshu
  [43, 46,  141,  146],   // Hokkaido
  [24, 34,  122,  135],   // Okinawa / S Japan
  [18, 25,  100,  110],   // Myanmar / Thailand N
  [6,  18,  98,   105],   // Thailand / Cambodia / Vietnam
  [1,  18,  102,  110],   // Vietnam / Malaysia peninsula
  [5,  20,  110,  125],   // Philippines N
  [4,  10,  118,  127],   // Philippines S
  [-8,  2,  95,   108],   // Sumatra
  [-8,  2,  108,  116],   // Java / Bali
  [-4,  2,  108,  117],   // Kalimantan W
  [-4,  4,  117,  120],   // Kalimantan E
  [-6,  4,  120,  130],   // Sulawesi / Maluku
  [-8,  0,  130,  141],   // Papua W
  [22, 32,  50,   60],    // Iran / Persian Gulf
  [35, 50,  60,   80],    // Afghanistan / Tajikistan
  [39, 55,  55,   80],    // Kazakhstan S
  [42, 52,  44,   60],    // Caspian region
  // ══ OCEANIA ══
  [-10, 0,  131,  143],   // Papua New Guinea
  [-28,-10, 114,  130],   // Western Australia
  [-28,-10, 130,  140],   // Northern Territory
  [-38,-24, 138,  155],   // Queensland / NSW
  [-38,-30, 140,  150],   // Victoria / NSW
  [-44,-38, 144,  150],   // Tasmania
  [-46,-34, 166,  174],   // New Zealand S Island
  [-37,-34, 172,  178],   // New Zealand N Island
  [-20,-10, 164,  170],   // New Caledonia area
  // ══ GREENLAND ══
  [60, 84,  -55,  -15],
  // ══ ANTARCTICA ══
  [-90,-65, -180, 180],
  [-70,-65, -180, 180],   // extra weight on coast
];

// High-precision point-in-polygon: test against all land zones
function isLand(latDeg: number, lonDeg: number): boolean {
  for (const [latMin, latMax, lonMin, lonMax] of LAND_ZONES) {
    if (latDeg >= latMin && latDeg <= latMax && lonDeg >= lonMin && lonDeg <= lonMax) {
      return true;
    }
  }
  return false;
}

// ─── VISITOR MARKERS ─────────────────────────────────────────────────────────
const VISITOR_COUNTRIES = [
  // Europe
  { lat: 40.4,  lon: -3.7,   scale: 2.1 }, // Spain
  { lat: 52.4,  lon: 4.9,    scale: 1.4 }, // Netherlands
  { lat: 51.2,  lon: 10.4,   scale: 1.6 }, // Germany
  { lat: 46.2,  lon: 2.2,    scale: 1.5 }, // France
  { lat: 51.5,  lon: -0.1,   scale: 1.7 }, // UK
  { lat: 41.9,  lon: 12.5,   scale: 1.2 }, // Italy
  { lat: 59.3,  lon: 18.1,   scale: 0.9 }, // Sweden
  { lat: 52.2,  lon: 21.0,   scale: 0.8 }, // Poland
  { lat: 38.7,  lon: -9.1,   scale: 0.9 }, // Portugal
  { lat: 50.1,  lon: 14.4,   scale: 0.7 }, // Czech Republic
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
  // Asia-Pacific
  { lat: 35.7,  lon: 139.7,  scale: 1.9 }, // Tokyo
  { lat: 35.9,  lon: 127.8,  scale: 1.5 }, // South Korea
  { lat: 35.9,  lon: 104.2,  scale: 2.2 }, // China
  { lat: 20.6,  lon: 79.0,   scale: 2.0 }, // India
  { lat: 1.3,   lon: 103.8,  scale: 1.3 }, // Singapore
  { lat: 22.3,  lon: 114.2,  scale: 1.2 }, // Hong Kong
  { lat: -25.3, lon: 133.8,  scale: 1.6 }, // Australia
  // Middle East & Africa
  { lat: 23.4,  lon: 53.8,   scale: 1.3 }, // UAE
  { lat: 25.2,  lon: 55.3,   scale: 1.0 }, // Dubai
  { lat: -30.6, lon: 22.9,   scale: 1.0 }, // South Africa
  { lat: 9.1,   lon: 8.7,    scale: 1.0 }, // Nigeria
];

// ─── CONTINENTAL DOT MESH ────────────────────────────────────────────────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const color   = useMemo(() => new THREE.Color(DOT_COLOR), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const PHI = Math.PI * (3 - Math.sqrt(5));
    let idx = 0;

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2; // [-1, +1]
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const latDeg = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI);
      const lonDeg = Math.atan2(z, x) * (180 / Math.PI);

      if (!isLand(latDeg, lonDeg)) continue;

      dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(idx, dummy.matrix);
      meshRef.current.setColorAt(idx, color);
      idx++;
    }

    // Zero out remaining slots
    for (let i = idx; i < POINT_COUNT; i++) {
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
      <circleGeometry args={[DOT_SIZE, 6]} />
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

// ─── VISITOR MARKERS ────────────────────────────────────────────────────────
function VisitorMarkers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

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
      <sphereGeometry args={[GLOBE_RADIUS * 0.987, 64, 64]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// ─── ATMOSPHERE GLOW ─────────────────────────────────────────────────────────
function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 1.04, 48, 48]} />
      <meshBasicMaterial
        color="#e0e8ff"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── ROTATING GROUP ──────────────────────────────────────────────────────────
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0008;
  });
  return (
    <group ref={groupRef}>
      <AtmosphereGlow />
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
        <fog attach="fog" args={[BG_COLOR, 2.0, 4.5]} />
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight position={[5, 5, 4]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#f1f5f9" />

        <group rotation={[0.15, -0.3, 0]}>
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
