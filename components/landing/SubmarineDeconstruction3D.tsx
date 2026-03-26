"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";

export default function SubmarineDeconstruction3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-screen bg-[#050505]" />;

  return (
    <section className="relative w-full h-[300vh] bg-[#050505]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* ULTRA-STABLE FALLBACK CANVAS */}
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#D4FF2B" />
            </mesh>
          </Float>

          {/* Simple Text Indicator */}
          <mesh position={[0, -3, 0]}>
             <boxGeometry args={[4, 0.1, 0.1]} />
             <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        </Canvas>

        {/* Decorative Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <h2 className="text-[10vw] font-aztec-h1 text-[var(--aztec-parchment)] opacity-5 select-none whitespace-nowrap">
                WHALE ALERT CORPORATION
            </h2>
        </div>
      </div>
    </section>
  );
}
