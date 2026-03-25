"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Float, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ShieldAlert, Zap, Crosshair, Radar, Target, Network } from "lucide-react";

// --- HTML Annotation Component (Safe & Stylized) ---
function Annotation({ title, description, icon: Icon, visible, side = "right" }: { title: string, description: string, icon: any, visible: boolean, side?: "left" | "right" | "top" | "bottom" }) {
  if (!visible) return null;
  
  return (
    <Html
      transform={false}
      distanceFactor={15}
      position={[side === "left" ? -4 : side === "right" ? 4 : 0, side === "top" ? 3 : side === "bottom" ? -3 : 0, 0]}
      style={{
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: 100
      }}
    >
      <div className="w-[300px] bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/10 rounded-[2rem] p-6 shadow-2xl relative select-none">
        <div className="absolute inset-0 noise-bg opacity-[0.03] rounded-[2rem]" />
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[var(--aztec-ink)]/5 flex items-center justify-center shadow-inner">
            <Icon size={14} className="text-[var(--aztec-ink)]" />
          </div>
          <h4 className="text-[var(--aztec-ink)] text-[11px] font-aztec-mono font-black uppercase tracking-widest">
            {title}
          </h4>
        </div>
        <p className="text-[var(--aztec-ink)]/60 text-[11px] leading-relaxed font-aztec-body relative z-10">
          {description}
        </p>
        
        {/* Dynamic Connector Line */}
        <div className={`absolute bg-[var(--aztec-orchid)]/20 ${side === 'right' ? 'h-[1px] w-12 top-1/2 -left-12 -translate-y-1/2' : side === 'left' ? 'h-[1px] w-12 top-1/2 -right-12 -translate-y-1/2' : side === 'top' ? 'w-[1px] h-12 left-1/2 -bottom-12 -translate-x-1/2' : 'w-[1px] h-12 left-1/2 -top-12 -translate-x-1/2'}`} />
      </div>
    </Html>
  );
}

// --- The Typhoon Rig: Optimized with zero external scroll dependencies ---
function TyphoonRig({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Group>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // 0.0 -> 0.4: Solid -> Transparent
  const transparency = Math.min(scrollProgress * 2.5, 1);
  // 0.4 -> 1.0: Explode
  const explode = Math.max(0, (scrollProgress - 0.4) / 0.6);

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

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation + Mouse Parallax
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.x * 0.1, 0.1);
    }
    if (scanRef.current) {
      scanRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 5;
    }
  });

  const hullMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#2a2a2a",
    metalness: 0.9,
    roughness: 0.1,
    transmission: transparency * 0.9,
    transparent: true,
    opacity: 1 - transparency * 0.3,
    thickness: 2,
    ior: 1.5,
  }), [transparency]);

  const innerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    metalness: 0.8,
    roughness: 0.2,
    emissive: "#39FF14", // Aztec Verde Chillon
    emissiveIntensity: 0.05
  }), []);

  const reactColor = "#D4FF2B"; // Aztec Chartreuse

  return (
    <group ref={groupRef}>
      {/* Sovereign Scan Ring */}
      <group ref={scanRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.02, 16, 100]} />
          <meshStandardMaterial color={reactColor} emissive={reactColor} emissiveIntensity={5} transparent opacity={0.6} />
        </mesh>
        <pointLight intensity={1} color={reactColor} distance={5} />
      </group>

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group scale={1.8}>
          
          {/* Main Hull */}
          <mesh position={[0, explode * 3, 0]} material={hullMaterial}>
            <capsuleGeometry args={[1.2, 8, 16, 32]} />
            <Annotation visible={scrollProgress > 0.05} side="top" title="Outer Shell" description="Titanium-grade encryption shielding your digital fingerprint." icon={ShieldAlert} />
          </mesh>

          {/* Core Structure */}
          {[-0.7, 0.7].map((x, i) => (
            <mesh key={i} position={[x + (i === 0 ? -explode : explode) * 2, -0.2, 0]} material={innerMaterial}>
              <capsuleGeometry args={[0.5, 6, 12, 16]} />
              {i === 1 && <Annotation visible={scrollProgress > 0.2} side="right" title="Dual Core" description="Parallel architecture for cross-chain liquidity handshakes." icon={Network} /> }
            </mesh>
          ))}

          {/* Reactors */}
          <group position={[3.5 + explode * 5, 0, 0]}>
             <mesh material={new THREE.MeshStandardMaterial({ color: reactColor, emissive: reactColor, emissiveIntensity: 2 })}>
               <sphereGeometry args={[0.4, 16, 16]} />
               <Annotation visible={scrollProgress > 0.6} side="bottom" title="Fusion Network" description="Hyper-efficient block resolution engine." icon={Zap} />
             </mesh>
          </group>

          {/* Silos (Representing Data Slots) */}
          <group position={[0, 0.8 + explode * 6, 0]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[(i - 3.5) * 0.4, 0, 0]} material={innerMaterial}>
                <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
              </mesh>
            ))}
            <Annotation visible={scrollProgress > 0.4} side="left" title="Logic Silos" description="Compartmentalized zero-knowledge proof execution nodes." icon={Target} />
          </group>

          {/* Logic Nodes (Data Points) */}
          <group>
            {Array.from({ length: 20 }).map((_, i) => (
              <mesh key={i} position={[Math.sin(i) * 5, Math.cos(i) * 5, Math.tan(i) * 2]} scale={0.05}>
                <sphereGeometry />
                <meshStandardMaterial color={reactColor} emissive={reactColor} emissiveIntensity={2} />
              </mesh>
            ))}
          </group>

        </group>
      </Float>
    </group>
  );
}

export default function SubmarineDeconstruction3D() {
  const [mounted, setMounted] = useState(false);
  const [scroll, setScroll] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // SAFE SCROLL HANDLER: Dependency-free, standard DOM
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const winH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (sectionRef.current.offsetHeight - winH)));
      setScroll(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return <div className="w-full h-screen bg-[#050505]" />;

  return (
    <section ref={sectionRef} className="relative w-full h-[500vh] bg-[#050505]">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        
        {/* Absolute Background Noise Shield */}
        <div className="absolute inset-0 noise-bg opacity-[0.2] pointer-events-none z-0" />
        
        <Canvas 
          gl={{ antialias: true, alpha: false, stencil: false, depth: true }} 
          camera={{ fov: 35, position: [0, 0, 25] }}
          dpr={1} // Static and safe
        >
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 50]} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#D4FF2B" />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#b450ff" />
          
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <TyphoonRig scrollProgress={scroll} />
          
          <EffectComposer multisampling={4}>
            <Bloom luminanceThreshold={0.5} intensity={1.5} levels={9} mipmapBlur />
            <Vignette darkness={0.5} />
          </EffectComposer>
        </Canvas>

        {/* Decorative Watermarks */}
        <div className="absolute top-12 left-12 opacity-10 font-aztec-mono text-[9px] uppercase tracking-[0.6em] text-white">
          Structural Anatomy / Project 941 / Akula Class
        </div>
        <div className="absolute bottom-12 right-12 text-right opacity-30 font-aztec-serif italic text-white/50 text-7xl select-none">
          Whale Alert
        </div>
      </div>
    </section>
  );
}
