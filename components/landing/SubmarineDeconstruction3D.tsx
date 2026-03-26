"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { ShieldCheck, Target, Lock, Cpu, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- The Core Typhoon Rig in Three.js ---
function TyphoonRig({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Group>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const reactColor = "#D4FF2B"; // Aztec Chartreuse
  const orchidColor = "#b450ff"; // Aztec Orchid

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Compute animations based on scroll
  // 0.0 to 0.4: Solid submarine transitioning to transparency
  const transparency = Math.min(scrollProgress * 2.5, 1);
  // 0.4 to 1.0: Explode Deconstruction
  const explode = Math.max(0, (scrollProgress - 0.4) / 0.6);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Automatic gentle rotation + Mouse parallax
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.15, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.x * 0.15, 0.1);
    }
    if (scanRef.current) {
      // Oscillate scan ring back and forth along the X axis
      scanRef.current.position.x = Math.sin(state.clock.elapsedTime * 1.5) * 4;
    }
  });

  const wireframeMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    wireframe: true,
    transparent: true,
    opacity: 0.1 + (transparency * 0.2),
  });

  const hullMaterial = new THREE.MeshStandardMaterial({
    color: "#0a0a0a",
    roughness: 0.8,
    metalness: 0.5,
    transparent: true,
    opacity: 1 - transparency,
  });

  const innerMaterial = new THREE.MeshStandardMaterial({
    color: reactColor,
    emissive: reactColor,
    emissiveIntensity: 0.5 + explode * 1.5,
    roughness: 0.2,
    metalness: 0.8,
  });

  return (
    <group ref={groupRef}>
      {/* Sovereign Scan Ring */}
      <group ref={scanRef}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.5, 0.015, 16, 100]} />
          <meshBasicMaterial color={reactColor} transparent opacity={0.8} />
        </mesh>
        <pointLight intensity={1} color={reactColor} distance={3} />
      </group>

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group scale={1.8}>
          
          {/* Outer Hull (Splits Apart) */}
          <group position={[0, explode * 2, 0]}>
            <mesh material={hullMaterial} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.8, 4, 16, 32]} />
            </mesh>
            <mesh material={wireframeMaterial} rotation={[0, 0, Math.PI / 2]} scale={1.01}>
              <capsuleGeometry args={[0.8, 4, 16, 32]} />
            </mesh>
          </group>

          {/* Lower Hull (Sinks) */}
          <group position={[0, -explode * 2, 0]}>
            <mesh material={hullMaterial} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.78, 3.9, 16, 32]} />
            </mesh>
          </group>

          {/* The Inner Core (Institutional Reactor) */}
          <mesh rotation={[0, 0, Math.PI / 2]} scale={0.5 + explode * 0.2}>
            <cylinderGeometry args={[0.4, 0.4, 6, 16]} />
            <meshStandardMaterial color={reactColor} emissive={reactColor} emissiveIntensity={1} wireframe={explode > 0.5} />
          </mesh>

          {/* Logic Silos (Data Slots) */}
          <group position={[explode * 3, 0.5 + explode * 1.5, 0]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[(i - 2.5) * 0.4, 0, 0]} material={innerMaterial}>
                <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
              </mesh>
            ))}
          </group>

          {/* Cryptographic Vault (Bottom expansion) */}
          <group position={[-explode * 3, -0.5 - explode * 1.5, 0]}>
             {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={`vault-${i}`} position={[(i - 1.5) * 0.5, 0, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color={orchidColor} emissive={orchidColor} emissiveIntensity={1.5} wireframe={true} />
              </mesh>
            ))}
          </group>

          {/* Data Nodes (Floating particles) */}
          <group>
            {[...Array(25)].map((_, i) => {
              const x = Math.sin(i * 1.1) * 3;
              const y = Math.cos(i * 2.3) * 2;
              const z = Math.sin(i * 3.7) * 2;
              
              // Only disperse them when exploding
              const posX = x * (1 + explode * 1.5);
              const posY = y * (1 + explode * 2);
              const posZ = z * (1 + explode * 1.8);

              return (
                <mesh key={`node-${i}`} position={[posX, posY, posZ]} scale={0.03}>
                  <sphereGeometry />
                  <meshBasicMaterial color={i % 3 === 0 ? orchidColor : reactColor} />
                </mesh>
              );
            })}
          </group>

        </group>
      </Float>
    </group>
  );
}

// --- DOM Overlay Annotations ---
function DOMAnnotations({ scrollProgress }: { scrollProgress: number }) {
  // We use Framer Motion to sync DOM elements with the scroll state for perfect robustness 
  // without interfering with WebGL contexts.
  const showOuter = scrollProgress > 0.1 && scrollProgress < 0.6;
  const showInner = scrollProgress >= 0.5;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
      <AnimatePresence>
        {showOuter && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="absolute top-[30%] left-[10%] max-w-[280px]"
          >
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[var(--aztec-chartreuse)]/30 rounded-2xl p-6 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--aztec-chartreuse)] to-transparent rounded-t-2xl opacity-50" />
              <div className="w-10 h-10 bg-[var(--aztec-chartreuse)]/10 rounded-full flex items-center justify-center mb-4 border border-[var(--aztec-chartreuse)]/20 shadow-[0_0_15px_rgba(212,255,43,0.1)]">
                <ShieldCheck className="text-[var(--aztec-chartreuse)]" size={20} />
              </div>
              <h3 className="text-white font-aztec-mono text-[11px] uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--aztec-chartreuse)] rounded-full animate-pulse" />
                Titanium Hull
              </h3>
              <p className="text-white/50 text-[10px] uppercase font-aztec-mono tracking-widest leading-relaxed">
                Impenetrable zero-knowledge cryptographic shielding protecting sovereign data from public ledgers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInner && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
            className="absolute top-[20%] right-[10%] max-w-[280px]"
          >
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[var(--aztec-orchid)]/30 rounded-2xl p-6 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[var(--aztec-orchid)] to-transparent rounded-t-2xl opacity-50" />
              <div className="w-10 h-10 bg-[var(--aztec-orchid)]/10 rounded-full flex items-center justify-center mb-4 border border-[var(--aztec-orchid)]/20 shadow-[0_0_15px_rgba(180,80,255,0.1)]">
                <Cpu className="text-[var(--aztec-orchid)]" size={20} />
              </div>
              <h3 className="text-white font-aztec-mono text-[11px] uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--aztec-orchid)] rounded-full animate-pulse" />
                Logic Silos
              </h3>
              <p className="text-white/50 text-[10px] uppercase font-aztec-mono tracking-widest leading-relaxed">
                Compartmentalized execution nodes ensuring programmable institutional compliance without data leaks.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInner && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute bottom-[20%] left-[20%] max-w-[280px]"
          >
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Lock className="text-white/80" size={20} />
              </div>
              <h3 className="text-white font-aztec-mono text-[11px] uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                Sovereign Vault
              </h3>
              <p className="text-white/50 text-[10px] uppercase font-aztec-mono tracking-widest leading-relaxed">
                Decentralized institutional archiving architecture synchronized directly to your localized hardware daemon.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Assembly ---
export default function SubmarineDeconstruction3D() {
  const [mounted, setMounted] = useState(false);
  const [scroll, setScroll] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Robust Native Scroll Listener
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the section has travelled
      const totalScrollableDistance = height - windowHeight;
      const amountScrolled = -top;
      
      let progress = amountScrolled / totalScrollableDistance;
      progress = Math.max(0, Math.min(1, progress));
      setScroll(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    // Elegant fallback during SSR to prevent hydration mismatch entirely
    return <section className="relative w-full h-screen bg-[#050505]" />;
  }

  return (
    <section ref={sectionRef} className="relative w-full h-[300vh] bg-[#050505] selection:bg-[var(--aztec-orchid)]/30">
      
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-noise">
        {/* Deep Depth Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none opacity-80" />
        
        {/* DOM Annotations mapped to scroll state */}
        <DOMAnnotations scrollProgress={scroll} />

        {/* The Legendary WebGL Canvas */}
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 8, 20]} />
          
          {/* Institutional Lighting setup */}
          <ambientLight intensity={0.4} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#b450ff" />
          <pointLight position={[10, -10, -10]} intensity={0.5} color="#D4FF2B" />
          
          <TyphoonRig scrollProgress={scroll} />
        </Canvas>

        {/* Absolute Decorative Watermarks */}
        <div className="absolute top-12 left-12 opacity-10 font-aztec-mono text-[9px] uppercase tracking-[0.6em] text-white pointer-events-none hidden md:block z-0">
          Structural Anatomy / Project 941 / Akula Class
        </div>
        
        <div className="absolute bottom-12 right-12 text-right opacity-30 font-aztec-serif italic text-white/50 text-7xl select-none pointer-events-none hidden md:block z-0">
          Whale Alert
        </div>
      </div>
    </section>
  );
}
