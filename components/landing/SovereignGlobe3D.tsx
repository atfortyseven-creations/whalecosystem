"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// ─── 1. GLOBE BASE (INSTITUTIONAL AESTHETIC) ─────────────────────────────────
function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Slow idle rotation
    }
  });

  return (
    <Sphere ref={meshRef} args={[100, 64, 64]}>
      <meshPhysicalMaterial
        color="#02040a"
        emissive="#000000"
        roughness={0.7}
        metalness={0.8}
        clearcoat={0.1}
        wireframe={true}
        wireframeLinewidth={1}
        transparent={true}
        opacity={0.15}
      />
    </Sphere>
  );
}

// ─── 2. ATMOSPHERE / HALO ───────────────────────────────────────────────────
function Atmosphere() {
  return (
    <Sphere args={[102, 64, 64]}>
      <meshBasicMaterial
        color="#00C076"
        transparent={true}
        opacity={0.03}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </Sphere>
  );
}

// ─── 3. TRANSFER ARCS (BITCOIN TRANSACTIONS) ────────────────────────────────
function generateArc(startLat: number, startLng: number, endLat: number, endLng: number, radius: number) {
  const phi1 = (90 - startLat) * (Math.PI / 180);
  const theta1 = (startLng + 180) * (Math.PI / 180);
  
  const start = new THREE.Vector3(
    -(radius * Math.sin(phi1) * Math.cos(theta1)),
    radius * Math.cos(phi1),
    radius * Math.sin(phi1) * Math.sin(theta1)
  );

  const phi2 = (90 - endLat) * (Math.PI / 180);
  const theta2 = (endLng + 180) * (Math.PI / 180);
  
  const end = new THREE.Vector3(
    -(radius * Math.sin(phi2) * Math.cos(theta2)),
    radius * Math.cos(phi2),
    radius * Math.sin(phi2) * Math.sin(theta2)
  );

  const distance = start.distanceTo(end);
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  // Elevate the midpoint based on distance
  midPoint.normalize().multiplyScalar(radius + distance * 0.3);

  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  return curve.getPoints(50);
}

function Arc({ startLat, startLng, endLat, endLng, color, delay }: any) {
  const points = useMemo(() => generateArc(startLat, startLng, endLat, endLng, 100), [startLat, startLng, endLat, endLng]);
  const lineRef = useRef<any>(null);
  const [dashOffset, setDashOffset] = useState(0);

  useFrame((state, delta) => {
    // Animate the dash offset to simulate flow
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= delta * 2.0;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.8}
      dashed
      dashScale={50}
      dashSize={10}
      dashOffset={delay}
    />
  );
}

// ─── 4. NODES (CITIES/WALLETS) ──────────────────────────────────────────────
function Node({ lat, lng, radius, color }: { lat: number, lng: number, radius: number, color: string }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const pos = new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );

  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.8, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ─── 5. MAIN GLOBE COMPONENT ────────────────────────────────────────────────
export function SovereignGlobe3D() {
  const [arcs, setArcs] = useState<any[]>([]);

  // Generate random institutional transfers
  useEffect(() => {
    const newArcs = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      startLat: (Math.random() - 0.5) * 140, // Avoid absolute poles
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 140,
      endLng: (Math.random() - 0.5) * 360,
      color: Math.random() > 0.8 ? "#FF3B30" : "#00C076", // 80% Green (Bullish), 20% Red (Bearish)
      delay: Math.random() * 100
    }));
    setArcs(newArcs);
  }, []);

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 z-0 bg-[#FAFAFA]">
      <Canvas
        camera={{ position: [0, 0, 240], fov: 45, near: 1, far: 2000 }}
        dpr={[1, 2]} // Support high-DPI (Retina) for crisp rendering
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: false 
        }}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Institutional Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 50, 100]} intensity={1.5} />
        <pointLight position={[-100, -50, -100]} intensity={0.5} color="#00C076" />

        <group rotation={[0.2, 0, 0]}>
          <GlobeMesh />
          <Atmosphere />
          
          {arcs.map(arc => (
            <React.Fragment key={arc.id}>
              <Arc {...arc} />
              <Node lat={arc.startLat} lng={arc.startLng} radius={100} color={arc.color} />
              <Node lat={arc.endLat} lng={arc.endLng} radius={100} color={arc.color} />
            </React.Fragment>
          ))}
        </group>

        {/* Interaction Controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={120} 
          maxDistance={400}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
        />

        {/* High-Performance Bloom for Node/Arc Glow */}
        <EffectComposer disableNormalPass>
          <Bloom
            luminanceThreshold={0.2}
            mipmapBlur
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
