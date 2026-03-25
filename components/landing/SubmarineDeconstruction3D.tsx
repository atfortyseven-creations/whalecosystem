"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html, Float, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ShieldAlert, Cpu, Orbit, Zap, Waves, Crosshair, Radar, Target, Network } from "lucide-react";
import dynamic from 'next/dynamic';

// --- HTML Annotation Component ---
function Annotation({ title, description, icon: Icon, visible, side = "right" }: { title: string, description: string, icon: any, visible: boolean, side?: "left" | "right" | "top" | "bottom" }) {
  return (
    <Html
      transform
      distanceFactor={15}
      position={[side === "left" ? -4 : side === "right" ? 4 : 0, side === "top" ? 3 : side === "bottom" ? -3 : 0, 0]}
      style={{
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: `scale(${visible ? 1 : 0.95}) translateY(${visible ? 0 : 10}px)`,
        zIndex: visible ? 100 : 0
      }}
    >
      <div className="w-[320px] bg-black/40 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
            <Icon size={14} className="text-white/90" />
          </div>
          <h4 className="text-white text-sm font-medium tracking-wide">
            {title}
          </h4>
        </div>
        <p className="text-white/60 text-xs leading-relaxed font-light">
          {description}
        </p>
        
        {/* Elegant connecting lines */}
        <div className={`absolute bg-white/20 ${side === 'right' ? 'h-[1px] w-12 top-1/2 -left-12 -translate-y-1/2' : side === 'left' ? 'h-[1px] w-12 top-1/2 -right-12 -translate-y-1/2' : side === 'top' ? 'w-[1px] h-12 left-1/2 -bottom-12 -translate-x-1/2' : 'w-[1px] h-12 left-1/2 -top-12 -translate-x-1/2'}`} />
        <div className={`absolute w-1.5 h-1.5 rounded-full ${side === 'right' ? 'top-1/2 -left-12 -translate-y-1/2 -translate-x-1/2 bg-white/50' : side === 'left' ? 'top-1/2 -right-12 -translate-y-1/2 translate-x-1/2 bg-white/50' : side === 'top' ? 'left-1/2 -bottom-12 -translate-x-1/2 translate-y-1/2 bg-white/50' : 'left-1/2 -top-12 -translate-x-1/2 -translate-y-1/2 bg-white/50'}`} />
      </div>
    </Html>
  );
}

// --- Procedural 3D Submarine Rig (Typhoon Project-941 Akula) ---
function TyphoonRig() {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);
  
  // Outer Hull (X-Ray Target)
  const hullMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const hullRef = useRef<THREE.Mesh>(null);
  
  // Internal Components for Defragmentation
  const leftPressureHullRef = useRef<THREE.Mesh>(null);
  const rightPressureHullRef = useRef<THREE.Mesh>(null);
  const missileSilosRef = useRef<THREE.Group>(null);
  const reactorRoomRef = useRef<THREE.Mesh>(null);
  const torpedoRoomRef = useRef<THREE.Mesh>(null);
  const sailRef = useRef<THREE.Mesh>(null);
  
  // Annotation Visibility States
  const [showHull, setShowHull] = React.useState(false);
  const [showSilos, setShowSilos] = React.useState(false);
  const [showPressureHulls, setShowPressureHulls] = React.useState(false);
  const [showReactor, setShowReactor] = React.useState(false);
  const [showTorpedo, setShowTorpedo] = React.useState(false);

  // Procedural Materials
  const internalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#b450ff",
    emissive: "#b450ff",
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  const titaniumMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#a3e33f",
    emissive: "#a3e33f",
    emissiveIntensity: 0.2,
    metalness: 1.0,
    roughness: 0.4,
  }), []);

  const siloMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff3333",
    emissive: "#ff1111",
    emissiveIntensity: 0.3,
    metalness: 0.9,
    roughness: 0.1,
  }), []);

  useFrame((state, delta) => {
    if (!group.current || !hullMaterialRef.current) return;

    // Scroll Offsets
    // 0.0 - 0.2: Entry
    // 0.2 - 0.4: X-Ray Activation (Hull fades to glass)
    // 0.4 - 0.8: Defragmentation (Explosion)
    
    const xrayPhase = scroll.range(0.15, 0.25); // Fade to transparent
    const defragPhase = scroll.range(0.4, 0.5); // Explode outwards
    const spinPhase = scroll.range(0, 1);       // Full scroll rotation

    // 1. Overall rotation (Parallax & Cinematic Pan)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.PI * 1.5 + (Math.PI * 0.8 * spinPhase), 4, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, Math.sin(state.clock.elapsedTime * 0.5) * 0.05, 2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -Math.PI / 16 + (Math.PI / 12 * defragPhase), 2, delta);

    // 2. X-Ray Hull Material Transition
    // Transition from Solid Black Titanium to Glassy Wireframe Translucent
    hullMaterialRef.current.transmission = THREE.MathUtils.damp(hullMaterialRef.current.transmission, xrayPhase * 0.95, 4, delta);
    hullMaterialRef.current.opacity = THREE.MathUtils.damp(hullMaterialRef.current.opacity, 1 - (xrayPhase * 0.8), 4, delta);
    hullMaterialRef.current.roughness = THREE.MathUtils.damp(hullMaterialRef.current.roughness, 0.5 - (xrayPhase * 0.5), 4, delta);
    hullMaterialRef.current.wireframe = xrayPhase > 0.8;

    // 3. Defragmentation Explosive Assembly
    if (leftPressureHullRef.current && rightPressureHullRef.current && torpedoRoomRef.current && reactorRoomRef.current && missileSilosRef.current && sailRef.current) {
        
        // Twin Pressure Hulls split horizontally (Catamaran architecture)
        leftPressureHullRef.current.position.x = THREE.MathUtils.damp(leftPressureHullRef.current.position.x, -0.6 - (1.5 * defragPhase), 5, delta);
        rightPressureHullRef.current.position.x = THREE.MathUtils.damp(rightPressureHullRef.current.position.x, 0.6 + (1.5 * defragPhase), 5, delta);
        
        // Missiles elevate vertically from silos
        missileSilosRef.current.position.y = THREE.MathUtils.damp(missileSilosRef.current.position.y, 1.2 + (5 * defragPhase), 4, delta);
        
        // Sail lifts and spins slightly
        sailRef.current.position.y = THREE.MathUtils.damp(sailRef.current.position.y, 2.5 + (3 * defragPhase), 5, delta);
        sailRef.current.rotation.y = THREE.MathUtils.damp(sailRef.current.rotation.y, defragPhase * Math.PI / 4, 3, delta);

        // Torpedo Room pushes forward (Z axis)
        torpedoRoomRef.current.position.z = THREE.MathUtils.damp(torpedoRoomRef.current.position.z, 6 + (5 * defragPhase), 5, delta);
        
        // Reactors push backwards and split
        reactorRoomRef.current.position.z = THREE.MathUtils.damp(reactorRoomRef.current.position.z, -5 - (4 * defragPhase), 5, delta);
    }

    // Trigger UI Annotations based on scroll depth
    setShowHull(scroll.offset > 0.05 && scroll.offset < 0.35);    // Early view
    setShowPressureHulls(scroll.offset > 0.3 && scroll.offset < 0.8); // Mid explode
    setShowSilos(scroll.offset > 0.45 && scroll.offset < 0.9);        // Explode peak
    setShowTorpedo(scroll.offset > 0.6 && scroll.offset < 0.95);
    setShowReactor(scroll.offset > 0.7);
  });

  // Calculate 20x ICBM Silo positions (2 rows of 10)
  const silos = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        arr.push({ x: -0.4, z: i * 0.6 - 1.5 }); // Left Row
        arr.push({ x: 0.4, z: i * 0.6 - 1.5 });  // Right Row
    }
    return arr;
  }, []);

  // Calculate 6x Torpedo Tubes
  const torpedoTubes = useMemo(() => {
      return [
          { x: -0.3, y: 0.2 }, { x: 0.3, y: 0.2 },
          { x: -0.4, y: -0.2 }, { x: 0.4, y: -0.2 },
          { x: -0.2, y: -0.6 }, { x: 0.2, y: -0.6 }
      ];
  }, []);

  return (
    <group ref={group} position={[0, -1, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        
        {/* === OUTER HULL (AKULA MAIN CASING) === */}
        <mesh ref={hullRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[2.2, 12, 16, 32]} />
          <meshPhysicalMaterial 
            ref={hullMaterialRef}
            color="#050505"
            metalness={0.9}
            roughness={0.4}
            transmission={0}
            transparent={true}
            opacity={1}
            thickness={1.5}
            envMapIntensity={2}
            clearcoat={1}
            emissive="#a3e33f"
            emissiveIntensity={0.05}
          />
          <Annotation 
            visible={showHull} 
            side="top"
            title="Cobertura Aislante" 
            description="Una capa externa diseñada para fluir por los mercados digitales de forma silenciosa. Whale Alert Network protege tus movimientos desde el primer momento." 
            icon={ShieldAlert} 
          />
        </mesh>

        {/* === TWIN PRESSURE HULLS (CATAMARAN) === */}
        {/* Left Pressure Hull */}
        <mesh ref={leftPressureHullRef} position={[-0.6, 0, 1]} rotation={[Math.PI / 2, 0, 0]} material={titaniumMaterial}>
            <cylinderGeometry args={[0.8, 0.8, 10, 16]} />
        </mesh>
        
        {/* Right Pressure Hull */}
        <mesh ref={rightPressureHullRef} position={[0.6, 0, 1]} rotation={[Math.PI / 2, 0, 0]} material={titaniumMaterial}>
            <cylinderGeometry args={[0.8, 0.8, 10, 16]} />
            <Annotation 
                visible={showPressureHulls} 
                side="right"
                title="Estructura Central Doble" 
                description="Dos unidades de seguridad independientes. Mantenemos tu identidad y tu capital en compartimentos aislados para garantizar una privacidad impecable." 
                icon={Network} 
            />
        </mesh>

        {/* === 20x ICBM SILOS (R-39 STURGEON) === */}
        <group ref={missileSilosRef} position={[0, 1.2, 1]}>
             {silos.map((pos, i) => (
                 <mesh key={i} position={[pos.x, 0, pos.z]} material={siloMaterial}>
                     <cylinderGeometry args={[0.25, 0.25, 2.5, 12]} />
                 </mesh>
             ))}
             <Annotation 
                visible={showSilos} 
                side="left"
                title="Sistemas de Ejecución Paralela" 
                description="Múltiples unidades trabajando en sintonía para procesar miles de transacciones de forma veloz y segura, asegurando liquidez constante." 
                icon={Target} 
            />
        </group>

        {/* === SAIL / CONNING TOWER === */}
        <mesh ref={sailRef} position={[0, 2.5, -2]} material={internalMaterial}>
            {/* Base of the sail */}
            <boxGeometry args={[1.5, 2, 3]} />
            {/* Hydroplanes on sail */}
            <mesh position={[-1.2, 0, 0]} material={internalMaterial}>
                <boxGeometry args={[1.5, 0.1, 0.5]} />
            </mesh>
            <mesh position={[1.2, 0, 0]} material={internalMaterial}>
                <boxGeometry args={[1.5, 0.1, 0.5]} />
            </mesh>
             <Annotation 
                visible={showHull} // Show early alongside the hull
                side="bottom"
                title="Centro de Navegación" 
                description="El corazón inteligente de Whale Alert Network. Monitorea y analiza las corrientes del mercado para guiarte de forma segura en tus decisiones." 
                icon={Radar} 
            />
        </mesh>

        {/* === TORPEDO ROOM (BOW) === */}
        <group ref={torpedoRoomRef} position={[0, 0, 6]}>
            <mesh material={internalMaterial} position={[0, 0, -0.5]}>
                <sphereGeometry args={[1.1, 16, 16]} />
            </mesh>
            {torpedoTubes.map((pos, i) => (
                <mesh key={i} position={[pos.x, pos.y, 0.5]} rotation={[Math.PI / 2, 0, 0]} material={siloMaterial}>
                    <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
                </mesh>
            ))}
             <Annotation 
                visible={showTorpedo} 
                side="right"
                title="Módulos de Respuesta Rápida" 
                description="Herramientas de previsión activa. Se aseguran de que ningún observador externo pueda rastrear tus interacciones diarias." 
                icon={Crosshair} 
            />
        </group>

        {/* === NUCLEAR REACTORS & PROPULSION (STERN) === */}
        <group ref={reactorRoomRef} position={[0, 0, -5]}>
            {/* Left Reactor */}
            <mesh position={[-0.6, 0, 0]} material={siloMaterial}>
                <sphereGeometry args={[0.7, 16, 16]} />
            </mesh>
            {/* Right Reactor */}
            <mesh position={[0.6, 0, 0]} material={siloMaterial}>
                <sphereGeometry args={[0.7, 16, 16]} />
            </mesh>
            {/* Propellers */}
            <mesh position={[-0.8, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={titaniumMaterial}>
                <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
            </mesh>
            <mesh position={[0.8, 0, -2]} rotation={[Math.PI / 2, 0, 0]} material={titaniumMaterial}>
                <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
            </mesh>
             <Annotation 
                visible={showReactor} 
                side="bottom"
                title="Motor de Sincronización" 
                description="La energía pura y escalable que mantiene a nuestra red estructurada. Confianza total en tiempos de respuesta para una experiencia sin fricción." 
                icon={Zap} 
            />
        </group>

      </Float>
    </group>
  );
}

// --- Main Export Component ---
export default function SubmarineDeconstruction3D() {
  return (
    <section className="relative w-full h-[400vh] bg-[#020202]">
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-[5vh] w-full text-center z-10 pointer-events-none px-6">
        <div className="text-[12px] text-white/50 uppercase tracking-[0.4em] mb-4 font-light">
          Innovación Visual Interactiva
        </div>
        <h2 className="text-4xl md:text-6xl text-white font-light tracking-wide transition-opacity duration-1000 mix-blend-difference">
          Exposición <span className="font-medium italic">Estructural</span>
        </h2>
        <p className="text-[13px] text-white/60 max-w-lg mx-auto mt-6 font-light tracking-wide leading-relaxed">
          Haz scroll con suavidad para adentrarte en la arquitectura de Whale Alert Network. 
          Desliza para separar sus componentes y descubrir el núcleo de nuestro ecosistema.
        </p>
      </div>

      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <Canvas gl={{ antialias: false, powerPreference: "high-performance", alpha: false }} dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
          
          <color attach="background" args={['#020202']} />
          <fog attach="fog" args={['#020202', 15, 45]} />
          
          <ambientLight intensity={0.4} />
          {/* Chartreuse Light targeting the bow */}
          <directionalLight position={[-10, -10, 10]} intensity={1.5} color="#a3e33f" />
          {/* Orchid Light targeting the rear / reactors */}
          <directionalLight position={[10, 10, -10]} intensity={2} color="#b450ff" />
          {/* Top highlight */}
          <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" distance={20} />

          {/* Deep Ocean Matrix Visuals */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
          
          <ScrollControls pages={4} damping={0.15}>
            <TyphoonRig />
          </ScrollControls>

          {/* Cinematic Post-Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.8} />
            <Noise opacity={0.06} />
            <Vignette eskil={false} offset={0.05} darkness={1.2} />
          </EffectComposer>
        </Canvas>

        {/* Ambient Subtle Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020202] via-transparent to-[#020202]" />
      </div>
    </section>
  );
}
