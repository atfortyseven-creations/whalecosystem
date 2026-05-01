"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — Fibonacci sphere with robust land-mask ─────────────────
//
// Strategy for continent rendering:
//   1. Try multiple CDN sources for the earth-topology texture.
//   2. On success: DARK pixels (R < 80) = LAND → show point; LIGHT = OCEAN → hide.
//   3. On total failure: fall back to a mathematical land approximation that looks
//      convincing without any external asset (no black blob ever again).
//
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT  = 100_000;
const GLOBE_RADIUS = 1.0;
const DOT_RADIUS   = 0.012; // world units — crisp without bleeding

// Multiple texture sources to try in order (CORS-friendly)
const TEXTURE_SOURCES = [
  "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png",
  "https://unpkg.com/three-globe@2.31.2/example/img/earth-topology.png",
  "https://cdn.jsdelivr.net/npm/three-globe@2.31.2/example/img/earth-topology.png",
];

// ─── Math-based land approximation (fallback if all textures fail) ────────────
// Returns true if a (lat, lon) in radians is approximately over land.
// Based on rough elliptical regions for the major continents.
function isApproximateLand(latRad: number, lonRad: number): boolean {
  const lat = latRad * (180 / Math.PI); // degrees
  const lon = lonRad * (180 / Math.PI);

  // Americas
  if (lon >= -170 && lon <= -34) {
    if (lat >= 15  && lat <= 72)  return true; // North America
    if (lat >= -55 && lat <= 12)  return true; // South America
  }
  // Europe + Africa
  if (lon >= -15 && lon <= 50) {
    if (lat >= 36  && lat <= 71)  return true; // Europe
    if (lat >= -35 && lat <= 37)  return true; // Africa
  }
  // Africa east extension
  if (lon >= 25 && lon <= 52 && lat >= -35 && lat <= 12) return true;
  // Asia
  if (lon >= 26 && lon <= 145 && lat >= 1  && lat <= 75) return true;
  // SE Asia + Indonesia
  if (lon >= 95 && lon <= 155 && lat >= -10 && lat <= 22) return true;
  // Australia
  if (lon >= 113 && lon <= 154 && lat >= -43 && lat <= -10) return true;
  // New Zealand
  if (lon >= 166 && lon <= 178 && lat >= -47 && lat <= -34) return true;
  // Greenland
  if (lon >= -55 && lon <= -18 && lat >= 60 && lat <= 84) return true;
  // Iceland
  if (lon >= -25 && lon <= -12 && lat >= 63 && lat <= 67) return true;
  // Japan
  if (lon >= 129 && lon <= 146 && lat >= 30 && lat <= 46) return true;

  return false;
}

// ─── Pre-compute Fibonacci sphere positions ───────────────────────────────────
function buildFibonacciPositions() {
  const PHI = Math.PI * (3 - Math.sqrt(5));
  const positions: Array<{ x: number; y: number; z: number; lat: number; lon: number }> = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    const yN    = 1 - (i / (POINT_COUNT - 1)) * 2;
    const rN    = Math.sqrt(Math.max(0, 1 - yN * yN));
    const theta = PHI * i;
    const xN    = Math.cos(theta) * rN;
    const zN    = Math.sin(theta) * rN;
    const lat   = Math.asin(yN);
    const lon   = Math.atan2(zN, xN);
    positions.push({ x: xN, y: yN, z: zN, lat, lon });
  }
  return positions;
}

// ─── GLOBE MESH COMPONENT ─────────────────────────────────────────────────────
function PointGlobeMesh() {
  const meshRef    = useRef<THREE.InstancedMesh>(null!);
  const dummy      = useMemo(() => new THREE.Object3D(), []);
  const isLand     = useRef<boolean[]>(new Array(POINT_COUNT).fill(false));
  const flashIntensity = useRef<number[]>(new Array(POINT_COUNT).fill(0));
  const maskApplied = useRef(false);

  const LAND_COLOR  = useMemo(() => new THREE.Color("#9ca3af"), []); // neutral grey
  const FLASH_COLOR = useMemo(() => new THREE.Color("#A855F7"), []); // purple flash
  const tmp         = useMemo(() => new THREE.Color(), []);

  // Pre-compute sphere positions once
  const positions = useMemo(() => buildFibonacciPositions(), []);

  // ── Step 1: Show a clean grey sphere immediately (never black) ──────────────
  useEffect(() => {
    if (!meshRef.current) return;

    // Apply math-based land approximation first so the globe looks good instantly
    applyMathFallback();

    // Then asynchronously try to load the real texture
    loadTextureAndApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyMathFallback() {
    if (!meshRef.current) return;
    const landColor  = new THREE.Color("#a0a0a0");
    const oceanColor = new THREE.Color("#d0d8e8"); // subtle ocean tint

    for (let i = 0; i < POINT_COUNT; i++) {
      const { x, y, z, lat, lon } = positions[i];
      const land = isApproximateLand(lat, lon);
      isLand.current[i] = land;

      dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
      dummy.lookAt(0, 0, 0);
      // Show ALL points, but colour differently — land darker, ocean faint
      dummy.scale.setScalar(land ? 1.0 : 0.35);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt!(i, land ? landColor : oceanColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }

  async function loadTextureAndApply() {
    for (const src of TEXTURE_SOURCES) {
      try {
        const resp = await Promise.race([
          fetch(src, { mode: "cors" }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
        ]) as Response;

        if (!resp.ok) continue;

        const blob = await resp.blob();
        const url  = URL.createObjectURL(blob);

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const W = img.naturalWidth;
            const H = img.naturalHeight;
            if (!W || !H) { resolve(); return; }

            const cvs = document.createElement("canvas");
            cvs.width  = W;
            cvs.height = H;
            const ctx = cvs.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const pixels = ctx.getImageData(0, 0, W, H).data;

            if (!meshRef.current) { resolve(); return; }

            const landColor  = new THREE.Color("#a0a0a0");
            const oceanHide  = new THREE.Color("#c0c8d8");

            for (let i = 0; i < POINT_COUNT; i++) {
              const { x, y, z, lat, lon } = positions[i];
              const u  = 0.5 + lon / (2 * Math.PI);
              const v  = 0.5 - lat / Math.PI;
              const px = Math.min(Math.floor(u * W), W - 1);
              const py = Math.min(Math.floor(v * H), H - 1);
              const idx = (py * W + px) * 4;

              // earth-topology.png: DARK (R < 80) = LAND elevation
              const land = pixels[idx] < 80;
              isLand.current[i] = land;

              dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
              dummy.lookAt(0, 0, 0);
              dummy.scale.setScalar(land ? 1.0 : 0); // hide ocean completely
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
              if (land) meshRef.current.setColorAt!(i, landColor);
              else meshRef.current.setColorAt!(i, oceanHide);
            }

            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
            maskApplied.current = true;
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          img.src = url;
        });

        if (maskApplied.current) return; // success — stop trying
      } catch {
        // try next source
      }
    }
    // All sources failed — math fallback already applied, nothing else to do
    console.warn("[SovereignGlobe] All texture sources failed. Using math fallback.");
  }

  // ── Animation loop ──────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m) return;

    m.rotation.y += 0.0008;

    // Trigger ~8 random land-point purple flashes per frame
    const land = isLand.current;
    const fl   = flashIntensity.current;
    for (let k = 0; k < 8; k++) {
      const r = Math.floor(Math.random() * POINT_COUNT);
      if (land[r]) fl[r] = 1.0;
    }

    let dirty = false;
    for (let i = 0; i < POINT_COUNT; i++) {
      if (fl[i] > 0) {
        fl[i] = Math.max(0, fl[i] - delta * 2.0);
        tmp.lerpColors(LAND_COLOR, FLASH_COLOR, fl[i]);
        m.setColorAt(i, tmp);
        dirty = true;
      }
    }
    if (dirty && m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      {/*
        16-segment circle = smooth round dots.
        DOT_RADIUS 0.012 at radius=1 gives crisp continent resolution.
      */}
      <circleGeometry args={[DOT_RADIUS, 16]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ─── ATMOSPHERE GLOW (subtle volumetric ring) ─────────────────────────────────
function AtmosphereRing() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.07 + 0.03 * Math.sin(clock.elapsedTime * 0.5);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.015, 64, 64]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div
      className="w-full h-full absolute inset-0 z-0"
      style={{ background: "transparent", cursor: "grab" }}
    >
      {/* Ambient purple volumetric glow behind the globe */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "560px",
          height: "560px",
          background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 42, near: 0.01, far: 100 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={3.0} color="#ffffff" />

        {/*
          Tilt slightly so Antarctica peeks and the globe looks 3-dimensional.
          X rotation 0.2 rad ≈ 11.5° tilt southward.
        */}
        <group rotation={[0.2, -0.4, 0]}>
          <AtmosphereRing />
          <PointGlobeMesh />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
