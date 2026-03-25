"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html, Float, Environment, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ShieldAlert, Cpu, Network, Zap, Waves } from "lucide-react";

// --- HTML Annotation Component ---
function Annotation({ title, description, icon: Icon, visible, side = "right" }: { title: string, description: string, icon: any, visible: boolean, side?: "left" | "right" | "top" | "bottom" }) {
  return (
    <Html
      transform
      distanceFactor={15}
      position={[side === "left" ? -2 : side === "right" ? 2 : 0, side === "top" ? 2 : side === "bottom" ? -2 : 0, 0]}
      style={{
        transition: "all 0.5s ease-out",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: `scale(${visible ? 1 : 0.8})`,
      }}
    >
      <div className="w-[320px] bg-[var(--aztec-ink)]/90 backdrop-blur-md rounded-2xl p-6 border border-[var(--aztec-orchid)]/50 shadow-[0_0_30px_rgba(180,80,255,0.2)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--aztec-orchid)]/20 flex items-center justify-center">
            <Icon size={20} className="text-[var(--aztec-orchid)] animate-pulse" />
          </div>
          <h4 className="font-aztec-h3 text-white text-lg uppercase tracking-tight leading-tight">
            {title}
          </h4>
        </div>
        <p className="font-aztec-body text-xs text-white/70 leading-relaxed font-medium">
          {description}
        </p>
        {/* Hacker connecting lines based on side */}
        <div className={`absolute bg-[var(--aztec-orchid)]/40 ${side === 'right' ? 'h-[1px] w-12 top-1/2 -left-12 -translate-y-1/2' : side === 'left' ? 'h-[1px] w-12 top-1/2 -right-12 -translate-y-1/2' : side === 'top' ? 'w-[1px] h-12 left-1/2 -bottom-12 -translate-x-1/2' : 'w-[1px] h-12 left-1/2 -top-12 -translate-x-1/2'}`} />
      </div>
    </Html>
  );
}

// --- Procedural 3D Submarine Rig ---
function SubmarineRig() {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);
  
  // Component Refs for Exploded View
  const noseRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  
  // Annotation States
  const [showNose, setShowNose] = React.useState(false);
  const [showCore, setShowCore] = React.useState(false);
  const [showTail, setShowTail] = React.useState(false);

  // Material setup (Wireframe + Glass effect)
  const hullMaterial = new THREE.MeshPhysicalMaterial({
    color: "#0a0a0a",
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.5,
    thickness: 0.5,
    wireframe: true,
    emissive: "#b450ff",
    emissiveIntensity: 0.2,
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#b450ff",
    emissive: "#b450ff",
    emissiveIntensity: 2,
    wireframe: false,
  });

  useFrame((state, delta) => {
    if (!group.current) return;

    // Scroll progress (0 to 1)
    const r1 = scroll.range(0 / 4, 1 / 4); // Phase 1: Dive & Initial rotate
    const r2 = scroll.range(1 / 4, 1 / 4); // Phase 2: Explode Core
    const r3 = scroll.range(2 / 4, 1 / 4); // Phase 3: Total Deconstruction

    // Overall Rotation
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.PI * 2 * r1 + (Math.PI * 1.5 * scroll.offset), 4, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -Math.PI / 8 * r1, 4, delta);

    // Exploded View Translations
    if (noseRef.current && tailRef.current && coreRef.current && engineRef.current && antennaRef.current) {
      // Nose moves forward
      noseRef.current.position.y = THREE.MathUtils.damp(noseRef.current.position.y, 3 + (4 * r2) + (2 * r3), 6, delta);
      // Tail moves backward
      tailRef.current.position.y = THREE.MathUtils.damp(tailRef.current.position.y, -3 - (4 * r2) - (2 * r3), 6, delta);
      // Core expands slightly
      coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, 1 + (0.5 * r2), 4, delta));
      // Engine separates
      engineRef.current.position.y = THREE.MathUtils.damp(engineRef.current.position.y, -4 - (5 * r2) - (4 * r3), 6, delta);
      engineRef.current.rotation.y += delta * 2 * (1 + r2 * 5); // Spin engine faster on explode
      // Antenna extends
      antennaRef.current.position.x = THREE.MathUtils.damp(antennaRef.current.position.x, 1 + (2 * r3), 4, delta);
    }

    // Trigger annotations
    setShowNose(scroll.offset > 0.15);
    setShowCore(scroll.offset > 0.4);
    setShowTail(scroll.offset > 0.65);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* 1. NOSE CONE (Sonar) */}
        <mesh ref={noseRef} position={[0, 3, 0]} material={hullMaterial}>
          <coneGeometry args={[1.5, 4, 16]} />
          <Annotation 
            visible={showNose} 
            side="right"
            title="Sonar de Cero Conocimiento" 
            description="Escaneamos rastros gigantes en el radar sin revelar tu identidad ni ubicación. Operaciones Stealth habilitadas 24/7." 
            icon={Waves} 
          />
        </mesh>

        {/* 2. MAIN HULL / CORE */}
        <mesh position={[0, 0, 0]} material={hullMaterial}>
          <cylinderGeometry args={[1.5, 1.5, 6, 16]} />
          
          <mesh ref={coreRef} material={coreMaterial}>
            <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
            <Annotation 
              visible={showCore} 
              side="left"
              title="El Núcleo Ballena" 
              description="El cerebro del sistema. Ejecuta contratos inteligentes institucionales y procesa liquidaciones a velocidad luz." 
              icon={Cpu} 
            />
          </mesh>

          {/* ANTENNA / COMMS */}
          <mesh ref={antennaRef} position={[1, 2, 0]} rotation={[0, 0, -Math.PI/4]} material={hullMaterial}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
             <Annotation 
              visible={showCore} 
              side="top"
              title="Blindaje Institucional" 
              description="Cortafuegos cuántico. Las mismas defensas que protegen billones de dólares en capital L1 y L2." 
              icon={ShieldAlert} 
            />
          </mesh>
        </mesh>

        {/* 3. TAIL COMPARTMENT */}
        <mesh ref={tailRef} position={[0, -3, 0]} material={hullMaterial}>
          <cylinderGeometry args={[1.5, 0.8, 2, 16]} />
          <Annotation 
            visible={showTail} 
            side="right"
            title="Antena Relé de Alto Cifrado" 
            description="Retransmisión P2P. Mensajería encriptada extremo a extremo para alianzas estratégicas bajo la superficie." 
            icon={Network} 
          />
        </mesh>

        {/* 4. ENGINE / PROPULSION */}
        <mesh ref={engineRef} position={[0, -4, 0]} material={coreMaterial}>
          <torusGeometry args={[0.6, 0.2, 8, 16]} />
          <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
             <boxGeometry args={[0.2, 2, 0.2]} />
             <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
             <boxGeometry args={[0.2, 2, 0.2]} />
             <meshBasicMaterial color="#ffffff" />
          </mesh>
           <Annotation 
            visible={showTail} 
            side="bottom"
            title="Motor de Rendimiento GPU" 
            description="Ingesta masiva de bloques. El motor consume el mempool entero y te devuelve resultados en milisegundos." 
            icon={Zap} 
          />
        </mesh>

      </Float>
    </group>
  );
}

// --- Main Export Component ---
export default function SubmarineDeconstruction3D() {
  return (
    <section className="relative w-full h-[300vh] bg-[#020202]">
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-20 w-full text-center z-10 pointer-events-none px-6">
        <div className="font-aztec-h2 text-[12px] text-[var(--aztec-orchid)] uppercase tracking-[0.6em] mb-4">
          Renderizado God-Tier WebGL
        </div>
        <h2 className="font-aztec-h1 text-4xl md:text-6xl text-white uppercase tracking-tighter">
          Descomposición <span className="text-[var(--aztec-orchid)] italic">Inmersiva</span>
        </h2>
        <p className="font-aztec-body text-sm text-white/50 max-w-xl mx-auto mt-4 font-bold">
          Scroll para desmontar la arquitectura. Gráficos en tiempo real procesados a 240Hz directamente en el núcleo del navegador. No backend required.
        </p>
      </div>

      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <Canvas gl={{ antialias: false, powerPreference: "high-performance" }}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
          
          <color attach="background" args={['#020202']} />
          <fog attach="fog" args={['#020202', 10, 40]} />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#b450ff" />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#a3e33f" />

          {/* Galaxy / Ocean Depth Feel */}
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
          
          <ScrollControls pages={3} damping={0.25}>
            <SubmarineRig />
          </ScrollControls>

          {/* Cinematic Post-Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>

        {/* Scanlines Overlay for Cypherpunk Vibe */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDAsMCwwLDApIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNCAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] mix-blend-overlay" />
      </div>
    </section>
  );
}
