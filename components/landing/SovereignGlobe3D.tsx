"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

// ─── 1. DOT GLOBE (FIBONACCI SPHERE) ─────────────────────────────────────────
function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 4000; // High fidelity points
  const radius = 100;

  // Generate dots using the Fibonacci sphere algorithm
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y
      
      const theta = phi * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      dummy.position.set(x * radius, y * radius, z * radius);
      dummy.lookAt(0, 0, 0); // Orient flat objects to surface
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Slow idle rotation
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[0.4, 8]} />
      {/* Purple dots representing the world shape */}
      <meshBasicMaterial color="#6D28D9" transparent opacity={0.65} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── 2. ELEGANT TRANSFER ARCS ────────────────────────────────────────────────
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
  // Elevate the midpoint based on distance for a graceful arc
  midPoint.normalize().multiplyScalar(radius + distance * 0.3);

  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  return curve.getPoints(50);
}

function Arc({ startLat, startLng, endLat, endLng, color, delay }: any) {
  const points = useMemo(() => generateArc(startLat, startLng, endLat, endLng, 100), [startLat, startLng, endLat, endLng]);
  const lineRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= delta * 1.5;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.6}
      dashed
      dashScale={30}
      dashSize={8}
      dashOffset={delay}
    />
  );
}

// ─── 3. ELEGANT NODES ────────────────────────────────────────────────────────
function Node({ lat, lng, radius, color, isOrigin }: { lat: number, lng: number, radius: number, color: string, isOrigin?: boolean }) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const pos = new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );

  return (
    <mesh position={pos}>
      <sphereGeometry args={[isOrigin ? 1.5 : 0.8, 16, 16]} />
      <meshBasicMaterial color={isOrigin ? "#D4AF37" : color} transparent opacity={isOrigin ? 1.0 : 0.5} />
    </mesh>
  );
}

// ─── 4. MAIN GLOBE COMPONENT ────────────────────────────────────────────────
export function SovereignGlobe3D() {
  const [arcs, setArcs] = useState<any[]>([]);

  useEffect(() => {
    // Generate clean, highly visible arcs
    const newArcs = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      startLat: (Math.random() - 0.5) * 140, 
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 140,
      endLng: (Math.random() - 0.5) * 360,
      // High-contrast arcs: Deep purple to black
      color: Math.random() > 0.5 ? "#2D0A59" : "#050505", 
      delay: Math.random() * 100
    }));
    setArcs(newArcs);
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
        {/* Light mode background */}
        <color attach="background" args={['#FAFAFA']} />
        
        {/* Soft lighting for a pure, clean look */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[100, 50, 100]} intensity={1} color="#ffffff" />

        <group rotation={[0.2, 0, 0]}>
          <PointGlobeMesh />
          
          {arcs.map(arc => (
            <React.Fragment key={arc.id}>
              <Arc {...arc} />
              {/* Distinctive origin node (gold) to clearly show where arcs come from */}
              <Node lat={arc.startLat} lng={arc.startLng} radius={100} color={arc.color} isOrigin={true} />
              <Node lat={arc.endLat} lng={arc.endLng} radius={100} color={arc.color} />
            </React.Fragment>
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
