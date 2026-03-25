"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Float, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ShieldAlert, Zap, Crosshair, Radar, Target, Network } from "lucide-react";

// --- HTML Annotation Component ---
function Annotation({ title, description, icon: Icon, visible, side = "right" }: { title: string, description: string, icon: any, visible: boolean, side?: "left" | "right" | "top" | "bottom" }) {
  return (
    <Html
      transform={false}
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
        <div className={`absolute bg-white/20 ${side === 'right' ? 'h-[1px] w-12 top-1/2 -left-12 -translate-y-1/2' : side === 'left' ? 'h-[1px] w-12 top-1/2 -right-12 -translate-y-1/2' : side === 'top' ? 'w-[1px] h-12 left-1/2 -bottom-12 -translate-x-1/2' : 'w-[1px] h-12 left-1/2 -top-12 -translate-x-1/2'}`} />
        <div className={`absolute w-1.5 h-1.5 rounded-full ${side === 'right' ? 'top-1/2 -left-12 -translate-y-1/2 -translate-x-1/2 bg-white/50' : side === 'left' ? 'top-1/2 -right-12 -translate-y-1/2 translate-x-1/2 bg-white/50' : side === 'top' ? 'left-1/2 -bottom-12 -translate-x-1/2 translate-y-1/2 bg-white/50' : 'left-1/2 -top-12 -translate-x-1/2 -translate-y-1/2 bg-white/50'}`} />
      </div>
    </Html>
  );
}

// --- Typhoon SSBN Akula Rig (Receives scroll progress as a prop) ---
function TyphoonRig({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // X-Ray transparency: 0-40% scroll = solid -> transparent
  const transparency = Math.min(scrollProgress * 2.5, 1);
  // Defragmentation: 40-100% scroll = explode
  const explode = Math.max(0, (scrollProgress - 0.4) / 0.6);

  const showHull        = scrollProgress > 0.05;
  const showPressureHulls = scrollProgress > 0.15;
  const showSilos       = scrollProgress > 0.25;
  const showTorpedo     = scrollProgress > 0.35;
  const showReactor     = scrollProgress > 0.45;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const hullMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#4a5e6a"),
    metalness: 0.8,
    roughness: 0.2,
    transmission: transparency * 0.85,
    transparent: true,
    opacity: 1 - transparency * 0.4,
    wireframe: transparency > 0.7,
  }), [transparency]);

  const innerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a3a4a"),
    metalness: 0.9,
    roughness: 0.1,
    emissive: new THREE.Color("#1a2a3a"),
    emissiveIntensity: 0.3,
  }), []);

  const siloMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8ba0b0"),
    metalness: 0.95,
    roughness: 0.05,
    emissive: new THREE.Color("#2244aa"),
    emissiveIntensity: 0.4,
  }), []);

  const reactorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ff6600"),
    emissive: new THREE.Color("#ff4400"),
    emissiveIntensity: 1.5,
    metalness: 0.7,
    roughness: 0.3,
  }), []);

  return (
    <group ref={groupRef}>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.3}>
        <group>
          {/* === OUTER HULL === */}
          <mesh
            position={[0, 0 + explode * 2, 0]}
            material={hullMaterial}
          >
            <capsuleGeometry args={[1.2, 7, 16, 32]} />
            {showHull && (
              <Annotation
                visible={showHull}
                side="top"
                title="Cobertura Aislante"
                description="Una capa externa diseñada para fluir por los mercados digitales de forma silenciosa. Whale Alert Network protege tus movimientos desde el primer momento."
                icon={ShieldAlert}
              />
            )}
          </mesh>

          {/* === TWIN PRESSURE HULLS === */}
          {[-0.7, 0.7].map((xOffset, i) => (
            <mesh
              key={i}
              position={[xOffset + explode * (i === 0 ? -3 : 3), -0.3, 0]}
              material={innerMaterial}
            >
              <capsuleGeometry args={[0.55, 5.5, 12, 24]} />
              {i === 0 && (
                <Annotation
                  visible={showPressureHulls}
                  side="right"
                  title="Estructura Central Doble"
                  description="Dos unidades de seguridad independientes. Mantenemos tu identidad y tu capital en compartimentos aislados para garantizar una privacidad impecable."
                  icon={Network}
                />
              )}
            </mesh>
          ))}

          {/* === ICBM SILOS (20x) === */}
          <group position={[0, 0.6 + explode * 4, 0]}>
            {Array.from({ length: 10 }).map((_, i) => (
              <mesh key={i} position={[(i - 4.5) * 0.48, 0.6, 0]} material={siloMaterial}>
                <cylinderGeometry args={[0.09, 0.09, 1.2, 8]} />
              </mesh>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <mesh key={i + 10} position={[(i - 4.5) * 0.48, 0.6, 0.25]} material={siloMaterial}>
                <cylinderGeometry args={[0.09, 0.09, 1.2, 8]} />
              </mesh>
            ))}
            {showSilos && (
              <Annotation
                visible={showSilos}
                side="left"
                title="Sistemas de Ejecución Paralela"
                description="Múltiples unidades trabajando en sintonía para procesar miles de transacciones de forma veloz y segura, asegurando liquidez constante."
                icon={Target}
              />
            )}
          </group>

          {/* === CONTROL ROOM === */}
          <mesh position={[0, 1.2, 0]} material={innerMaterial}>
            <boxGeometry args={[1.6, 0.6, 0.9]} />
            {showHull && (
              <Annotation
                visible={showHull}
                side="bottom"
                title="Centro de Navegación"
                description="El corazón inteligente de Whale Alert Network. Monitorea y analiza las corrientes del mercado para guiarte de forma segura en tus decisiones."
                icon={Radar}
              />
            )}
          </mesh>

          {/* === TORPEDO ROOM (bow) === */}
          <group position={[-3.5 - explode * 2.5, 0, 0]}>
            {[-0.3, 0.3].map((y, i) => (
              <mesh key={i} position={[0, y, 0]} material={innerMaterial}>
                <cylinderGeometry args={[0.12, 0.12, 1.8, 8]} rotation={[0, 0, Math.PI / 2]} />
              </mesh>
            ))}
            {showTorpedo && (
              <Annotation
                visible={showTorpedo}
                side="right"
                title="Módulos de Respuesta Rápida"
                description="Herramientas de previsión activa. Se aseguran de que ningún observador externo pueda rastrear tus interacciones diarias."
                icon={Crosshair}
              />
            )}
          </group>

          {/* === TWIN REACTORS (stern) === */}
          <group position={[3.5 + explode * 2.5, 0, 0]}>
            {[-0.4, 0.4].map((z, i) => (
              <mesh key={i} position={[0, 0, z]} material={reactorMaterial}>
                <sphereGeometry args={[0.35, 16, 16]} />
              </mesh>
            ))}
            {showReactor && (
              <Annotation
                visible={showReactor}
                side="bottom"
                title="Motor de Sincronización"
                description="La energía pura y escalable que mantiene a nuestra red estructurada. Confianza total en tiempos de respuesta para una experiencia sin fricción."
                icon={Zap}
              />
            )}
          </group>

        </group>
      </Float>
    </group>
  );
}

// --- Main Export Component ---
export default function SubmarineDeconstruction3D() {
  const [isMounted, setIsMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  return (
    <section ref={sectionRef} className="relative w-full h-[400vh] bg-[#020202]">
      
      {/* Header Overlay */}
      <div className="absolute top-[5vh] w-full text-center z-10 pointer-events-none px-6">
        <div className="text-[12px] text-white/50 uppercase tracking-[0.4em] mb-4 font-light">
          Innovación Visual Interactiva
        </div>
        <h2 className="text-4xl md:text-6xl text-white font-light tracking-wide mix-blend-difference">
          Exposición <span className="font-medium italic">Estructural</span>
        </h2>
        <p className="text-[13px] text-white/60 max-w-lg mx-auto mt-6 font-light tracking-wide leading-relaxed">
          Haz scroll con suavidad para adentrarte en la arquitectura de Whale Alert Network.
          Desliza para separar sus componentes y descubrir el núcleo de nuestro ecosistema.
        </p>
      </div>

      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {isMounted ? (
          <Canvas gl={{ antialias: false, powerPreference: "high-performance", alpha: false }} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
            <color attach="background" args={['#020202']} />
            <fog attach="fog" args={['#020202', 15, 45]} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[-10, -10, 10]} intensity={1.5} color="#a3e33f" />
            <directionalLight position={[10, 10, -10]} intensity={2} color="#b450ff" />
            <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" distance={20} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />

            {/* TyphoonRig now receives scroll as a plain prop - NO ScrollControls needed */}
            <TyphoonRig scrollProgress={scrollProgress} />

            <EffectComposer>
              <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.8} />
              <Noise opacity={0.06} />
              <Vignette eskil={false} offset={0.05} darkness={1.2} />
            </EffectComposer>
          </Canvas>
        ) : (
          <div className="w-full h-full bg-[#020202]" />
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020202] via-transparent to-[#020202]" />
      </div>
    </section>
  );
}
