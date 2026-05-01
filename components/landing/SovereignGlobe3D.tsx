"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — Fibonacci sphere + Earth texture land mask ─────────────
// Renders only LAND points (water = invisible gap) for clear continent outlines.
// earth-topology.png: dark pixels = LAND, light pixels = OCEAN.
// Source: NASA Blue Marble (via three-globe CDN, permanent asset).
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 120_000; // Enough for crisp continents without jank
const GLOBE_RADIUS = 1.0;    // World-unit radius; scaled by group below

function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const isLand = useRef<boolean[]>(new Array(POINT_COUNT).fill(false));
  const flash  = useRef<number[]>(new Array(POINT_COUNT).fill(0));

  // ── Build initial sphere positions (all shown in grey until texture loads) ─
  useEffect(() => {
    if (!meshRef.current) return;

    const PHI = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const baseColor = new THREE.Color("#c8c8c8");

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
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, baseColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // ── Load Earth topology mask and apply land/water silhouette ─────────────
    // earth-topology.png: DARK pixels (R < 80) = LAND, LIGHT pixels = OCEAN.
    // We hide ocean points (scale=0) and colour land points for continent outlines.
    const applyMask = async () => {
      try {
        // Use the NASA-sourced earth-topology image (dark=land, bright=ocean)
        const SRC = "https://unpkg.com/three-globe/example/img/earth-topology.png";
        const resp = await fetch(SRC);
        const blob = await resp.blob();
        const url  = URL.createObjectURL(blob);

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const W = img.naturalWidth;
            const H = img.naturalHeight;
            const cvs = Object.assign(document.createElement("canvas"), { width: W, height: H });
            const ctx = cvs.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, W, H).data;

            const landColor  = new THREE.Color("#a0a0a0"); // Soft neutral grey land
            const peakColor  = new THREE.Color("#A855F7"); // Purple flash on transactions
            void peakColor;

            for (let i = 0; i < POINT_COUNT; i++) {
              const yN = 1 - (i / (POINT_COUNT - 1)) * 2;
              const rN = Math.sqrt(Math.max(0, 1 - yN * yN));
              const theta = PHI * i;
              const xN = Math.cos(theta) * rN;
              const zN = Math.sin(theta) * rN;

              // Spherical → UV
              const lat = Math.asin(yN);                  // [-π/2, π/2]
              const lon = Math.atan2(zN, xN);             // [-π, π]
              const u   = 0.5 + lon / (2 * Math.PI);      // [0,1]
              const v   = 0.5 - lat / Math.PI;            // [0,1], 0=north

              const px = Math.min(Math.floor(u * W), W - 1);
              const py = Math.min(Math.floor(v * H), H - 1);
              const idx = (py * W + px) * 4;

              // earth-topology.png: DARK (R < 80) = LAND elevation
              const isLandPixel = data[idx] < 80;
              isLand.current[i] = isLandPixel;

              dummy.position.set(xN * GLOBE_RADIUS, yN * GLOBE_RADIUS, zN * GLOBE_RADIUS);
              dummy.lookAt(0, 0, 0);
              dummy.scale.setScalar(isLandPixel ? 1 : 0); // hide ocean
              dummy.updateMatrix();

              meshRef.current.setMatrixAt(i, dummy.matrix);
              if (isLandPixel) meshRef.current.setColorAt!(i, landColor);
            }

            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => resolve(); // silently ignore — sphere fallback still visible
          img.src = url;
        });
      } catch (e) {
        console.warn("[SovereignGlobe] Mask load failed — showing full sphere fallback:", e);
      }
    };

    applyMask();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animation loop: auto-rotate + purple transaction flashes ───────────────
  const baseColor = useMemo(() => new THREE.Color("#a0a0a0"), []);
  const peakColor = useMemo(() => new THREE.Color("#A855F7"), []);
  const tmp       = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m) return;

    m.rotation.y += 0.0008;

    // Trigger ~12 random land-point flashes per frame
    const land = isLand.current;
    const fl   = flash.current;
    for (let k = 0; k < 12; k++) {
      const r = Math.floor(Math.random() * POINT_COUNT);
      if (land[r]) fl[r] = 1.0;
    }

    let dirty = false;
    for (let i = 0; i < POINT_COUNT; i++) {
      if (fl[i] > 0) {
        fl[i] = Math.max(0, fl[i] - delta * 2.5);
        tmp.lerpColors(baseColor, peakColor, fl[i]);
        m.setColorAt(i, tmp);
        dirty = true;
      }
    }
    if (dirty && m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      {/* 
        Dot size: 0.018 world units at radius=1 → visible as crisp pixel cluster.
        Larger = more 'paint-filled' continents, smaller = finer grain.
        0.018 gives clear country outlines without blobs.
      */}
      <circleGeometry args={[0.018, 6]} />
      <meshBasicMaterial vertexColors transparent opacity={0.95} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 z-0 bg-transparent">
      {/* Ambient purple volumetric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#8B5CF6]/12 blur-[100px] rounded-full pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 42, near: 0.01, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={2.5} color="#ffffff" />

        {/* 
          Tilt slightly (x=0.2) so Antarctica is partially visible and 
          the globe feels 3-dimensional.  No scale distortion — radius=1 
          maps directly to the camera frustum set above.
        */}
        <group rotation={[0.2, -0.4, 0]}>
          <PointGlobeMesh />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          autoRotate={true}
          autoRotateSpeed={0.4}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
