"use client";

/**
 * QDs Token — Full Page
 * 
 * 3D WebGL atom via @react-three/fiber, targeting 240hz.
 * Scroll drives Y-axis rotation: scroll down = spin right, scroll up = spin left.
 * All content on pure white, pure black text — Humanity Ledger design language.
 */

import React, {
  useRef, useEffect, useState, Suspense,
  forwardRef, useImperativeHandle,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SCROLL VELOCITY STORE
// Tracked in a ref — no React state, zero re-renders.
// ─────────────────────────────────────────────────────────────────────────────

function useScrollVelocity() {
  const vel = useRef(0);
  const last = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY;
      const raw = curr - last.current;
      // Scale and accumulate — clamp to avoid hyperspeed
      vel.current = Math.max(-55, Math.min(55, vel.current + raw * 2.4));
      last.current = curr;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Dampen velocity each animation frame — mimic physical inertia
    const dampen = () => {
      vel.current *= 0.88;
      raf.current = requestAnimationFrame(dampen);
    };
    raf.current = requestAnimationFrame(dampen);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return vel;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITAL RING
// A single torus at a given inclination. Rotates constantly + scroll effect.
// ─────────────────────────────────────────────────────────────────────────────

function OrbitalRing({
  inclination,
  azimuth,
  vel,
  baseSpeed,
}: {
  inclination: number;   // tilt from horizontal (radians)
  azimuth: number;       // rotation about Y axis (radians)
  vel: React.MutableRefObject<number>;
  baseSpeed: number;     // base constant rotation speed (rad/s)
}) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    // 240hz target — dt is already fractional seconds, no extra clamp needed
    angle.current += dt * baseSpeed + vel.current * 0.0012;
    ref.current.rotation.y = angle.current;
  });

  return (
    <mesh ref={ref} rotation={[inclination, azimuth, 0]}>
      <torusGeometry args={[2.8, 0.04, 64, 256]} />
      <meshPhysicalMaterial
        color="#222222"
        metalness={1.0}
        roughness={0.15}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={3.0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ELECTRON — tiny sphere that races around an orbit path
// ─────────────────────────────────────────────────────────────────────────────

function Electron({
  inclination,
  azimuth,
  phase,
  orbitRadius,
  vel,
}: {
  inclination: number;
  azimuth: number;
  phase: number;
  orbitRadius: number;
  vel: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const t = useRef(phase);

  useFrame((_, dt) => {
    if (!groupRef.current || !meshRef.current) return;
    // Electrons orbit faster than rings
    t.current += dt * 1.6 + Math.abs(vel.current) * 0.009;
    const x = Math.cos(t.current) * orbitRadius;
    const y = Math.sin(t.current) * orbitRadius;
    meshRef.current.position.set(x, y, 0);
  });

  return (
    <group ref={groupRef} rotation={[inclination, azimuth, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NUCLEUS — the central atom core
// ─────────────────────────────────────────────────────────────────────────────

function Nucleus({ vel }: { vel: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.3 + vel.current * 0.003;
    ref.current.rotation.x += dt * 0.12;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.55, 64, 64]} />
      <meshPhysicalMaterial
        color="#000000"
        metalness={1.0}
        roughness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={4.0}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOM GROUP — all rings + nucleus + electrons + master scroll rotation
// ─────────────────────────────────────────────────────────────────────────────

function AtomGroup({ vel }: { vel: React.MutableRefObject<number> }) {
  const masterRef = useRef<THREE.Group>(null);

  // Master group: scroll drives Y rotation AND massive scale
  useFrame((_, dt) => {
    if (!masterRef.current) return;
    // Lerp toward velocity — smooth, physics-like spin
    const targetSpin = vel.current * 0.02;
    masterRef.current.rotation.y += (targetSpin - masterRef.current.rotation.y) * 0.08;
    // Constant slow tilt oscillation on X
    masterRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.25;

    // SCROLL-DRIVEN MASSIVE SCALE
    const scrollY = window.scrollY;
    // Base scale is 1, max scale is ~3.5 at 2000px scroll, shrinking back at end
    const rawScale = 1.0 + (scrollY * 0.0015);
    // Smooth damp scale
    masterRef.current.scale.lerp(new THREE.Vector3(rawScale, rawScale, rawScale), 0.05);
  });

  // Three rings: horizontal, +60°, -60° tilt
  const RINGS = [
    { inclination: 0,                   azimuth: 0,             speed: 0.28 },
    { inclination:  Math.PI / 3,        azimuth: Math.PI / 5,   speed: 0.22 },
    { inclination: -Math.PI / 3,        azimuth: -Math.PI / 5,  speed: 0.32 },
  ];

  const ELECTRONS = [
    { inclination: 0,            azimuth: 0,            phase: 0 },
    { inclination:  Math.PI / 3, azimuth: Math.PI / 5,  phase: 2.1 },
    { inclination: -Math.PI / 3, azimuth: -Math.PI / 5, phase: 4.2 },
  ];

  return (
    <group ref={masterRef}>
      {RINGS.map((r, i) => (
        <OrbitalRing
          key={i}
          inclination={r.inclination}
          azimuth={r.azimuth}
          vel={vel}
          baseSpeed={r.speed}
        />
      ))}
      {ELECTRONS.map((e, i) => (
        <Electron
          key={i}
          inclination={e.inclination}
          azimuth={e.azimuth}
          phase={e.phase}
          orbitRadius={2.8}
          vel={vel}
        />
      ))}
      <Nucleus vel={vel} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE — lighting optimized for white background
// ─────────────────────────────────────────────────────────────────────────────

function Scene({ vel }: { vel: React.MutableRefObject<number> }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />

      {/* Dramatic Studio Lighting */}
      <directionalLight position={[5, 5, 5]} intensity={4.5} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={1.5} color="#ffffff" />
      <ambientLight intensity={1.2} color="#ffffff" />

      {/* HDR environment for hyper-realistic metallic reflections */}
      <Environment preset="studio" />

      {/* Float adds micro-breathing animation */}
      <Float speed={0.8} floatIntensity={0.3} rotationIntensity={0.1}>
        <AtomGroup vel={vel} />
      </Float>

      {/* Ultra-High Quality Post-Processing Pipeline */}
      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={1.2} 
          levels={8} 
        />
        <DepthOfField 
          focusDistance={0.0} 
          focalLength={0.02} 
          bokehScale={2} 
          height={480} 
        />
        <ChromaticAberration 
          blendFunction={BlendFunction.NORMAL} 
          offset={new THREE.Vector2(0.0008, 0.0008)} 
        />
        <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.1} darkness={0.3} />
      </EffectComposer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function QDsAtom({ vel, height = '100vh' }: { vel: React.MutableRefObject<number>; height?: string }) {
  return (
    <div className="w-full absolute inset-0" style={{ height }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          precision: 'highp',
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene vel={vel} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE CONTENT DATA
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Supply',      value: '21,000,000', sub: 'QDs — mathematically fixed' },
  { label: 'Decimal Precision', value: '8 places',   sub: '2.1 quadrillion units total' },
  { label: 'Distribution',      value: '100% mined', sub: 'Open participation only' },
  { label: 'Team Allocation',   value: '0%',          sub: 'No pre-mine, no reserves' },
  { label: 'Mainnet Launch',    value: 'Before 2027', sub: 'Genesis block before Dec 31 2026' },
  { label: 'Governance',        value: 'None',        sub: 'Supply rule is immutable' },
];

const SECTIONS = [
  {
    num: '01',
    title: 'What QDs is',
    paragraphs: [
      'QDs is a digital asset designed to act as the foundational unit of economic exchange within the Whale Alert network. It is not a governance token, a reward coupon, or a speculative vehicle with hidden unlock schedules. It is a base layer of exchange: finite, minable, and enforced entirely by the deployed contract code.',
      'The name derives from the concept of a quantum of data — the smallest indivisible unit of verifiable computational work. Just as physical matter cannot be reduced below the atomic scale, QDs cannot be created beyond its defined ceiling or subdivided beyond its defined precision.',
      'Every design decision for QDs was measured against one test: does this reduce complexity, or add it? Any structure that added complexity without adding a mathematical guarantee was removed. What remains is a token defined by absolute clarity.',
      'The full technical specification of QDs is publicly auditable from day one. There are no hidden parameters, no multisig admin keys, and no emergency override functions. The rules encoded at genesis govern QDs until the final token is mined.',
    ],
  },
  {
    num: '02',
    title: 'The 21,000,000 limit',
    paragraphs: [
      'The supply of QDs is capped at exactly twenty-one million tokens. This number is written into the genesis contract as an immutable constant. It cannot be changed by any vote, team decision, or on-chain governance action — because no such mechanism exists in the protocol.',
      'Scarcity is not a feature layered on top of QDs. It is the architecture. Every participant, from the first block to the last, can know in advance the total number of tokens that will ever exist. Uncertainty about future supply is removed by design, not by promise.',
      'Each token is divisible to eight decimal places, yielding two quadrillion one hundred trillion discrete units. This granularity is sufficient for all practical economic uses while preserving the mathematical weight of the twenty-one million ceiling.',
      'Any system claiming to offer QDs in quantities exceeding twenty-one million is operating outside the canonical protocol. The only authoritative record is the on-chain state of the genesis-deployed contract. No exception to this rule exists.',
    ],
  },
  {
    num: '03',
    title: 'Mining: earned, not issued',
    paragraphs: [
      'QDs is distributed exclusively through mining. There are no pre-mines, no team allocations, no investor reserves, and no foundation treasury. From the first block, every token enters circulation through computational work performed by open, permissionless participants.',
      'The mining process follows a deterministic emission schedule. As more computational power joins the network, the difficulty of finding a valid block increases proportionally, keeping the rate of new token issuance stable and predictable regardless of participation levels.',
      'Block rewards halve at fixed intervals following a geometric decay schedule. Each halving reduces the new tokens issued per block by fifty percent, extending the mining timeline while preserving the overall supply ceiling. The final QDs will be issued through fractional issuance as the block reward approaches its lower bound.',
      'Anyone with compatible hardware and a network connection can begin mining immediately after mainnet launch. There is no whitelist, no minimum stake requirement, and no registration process. The protocol is permissionless at every level of participation.',
    ],
  },
  {
    num: '04',
    title: 'Launch before 2027',
    paragraphs: [
      'The QDs mainnet will be deployed before the end of 2026. This is a technical commitment based on the current state of the protocol development. The codebase is in final review, testnet phases are underway, and the genesis block parameters are being finalized.',
      'A public testnet will be available to all developers and potential miners before the mainnet launch. The testnet allows full participation in the mining process using test tokens, giving the community time to configure hardware and audit the code before it matters on the live network.',
      'The testnet has a defined end date. When it concludes, the mainnet genesis block will be mined and the real emission schedule will begin. From that moment, the rules are fixed and the countdown to the final token starts.',
      'In this industry, deployment timelines have often served as moving targets used to buy time while teams quietly modified tokenomics or allocation structures. QDs has no allocation structures to protect and no investors to answer to. The deadline is real because there is nothing left to delay.',
    ],
  },
  {
    num: '05',
    title: 'Plain language, plain design',
    paragraphs: [
      'This document uses plain language because the subject does not require anything else. QDs is a minable, capped digital asset. The mechanics are straightforward. Obscuring simple things behind complex terminology is a method of misdirection, and misdirection has no place in a protocol built on transparency.',
      'There are no whitepapers filled with diagrams of circular value loops. There are no token burn mechanisms that conveniently benefit early holders. There is no ecosystem fund, no marketing wallet, and no locked vesting schedule that unlocks years after the launch hype has faded.',
      'What you read here is what the protocol does. The code is the final authority. If there is ever a discrepancy between this documentation and the deployed contract, the contract is correct and this document will be updated accordingly.',
      'QDs is built for those who understand that the simplest design is often the most resilient, and that the best economic model has the fewest moving parts. A hard cap, open mining, and a fixed schedule. Everything beyond that is noise.',
    ],
  },
  {
    num: '06',
    title: 'Role within Whale Alert',
    paragraphs: [
      'Within the Whale Alert ecosystem, QDs serves as the native unit of account for network-level operations. Access to certain data streams, priority queue positions, and direct API credits will be denominated in QDs. These are utility functions tied to real computational resources, not artificial access barriers.',
      'As the network grows and the mining supply decreases through successive halvings, the economics of scarcity will naturally align participant incentives with long-term network health. Miners are rewarded in the early phases for securing an unproven protocol. This is the correct structure.',
      'QDs is not designed to extract value from speculation. It is designed to hold value through mathematical scarcity and verified network utility. The difference matters because it determines how participants behave over time. Speculation creates volatility. Utility creates stability.',
      'Integration with the Whale Alert interface will be built progressively. The token will not be forced into existing features as a revenue mechanism. It will be adopted where it makes technical sense, and nowhere else.',
    ],
  },
  {
    num: '07',
    title: 'Verification',
    paragraphs: [
      'The full QDs codebase will be available for public review before the mainnet launch. Independent security researchers will be invited to audit the genesis contract and the consensus implementation. All audit reports will be published in full, including every finding regardless of severity.',
      'The on-chain ledger is the authoritative record of all token ownership and transaction history. There is no off-chain database, no administrative interface, and no mechanism through which any party can alter the ledger outside of valid on-chain transactions.',
      'Total supply, current circulating supply, mining difficulty, block reward, and time to final block are all calculable from publicly available chain data. Any third-party application can verify these figures independently without relying on data from the development team.',
      'This level of verifiability is not a technical achievement to be celebrated. It is a minimum requirement for any system claiming to operate on the principle of trustlessness. Anything less is a contradiction.',
    ],
  },
  {
    num: '08',
    title: 'Open participation',
    paragraphs: [
      'Participation in the QDs network requires no registration, no identity verification, and no permission from any central authority. Any device capable of running the mining client can connect to the network and contribute computational work in exchange for block rewards.',
      'The mining client will be open source and available for all major operating systems. Compiled binaries will be provided for common hardware configurations, but the source code is always the authoritative version. Anyone is free to compile, modify, and redistribute it under its open license.',
      'Receiving and sending QDs requires only a compatible wallet and a network connection. There are no protocol-level KYC requirements. Individual exchanges or services that choose to list QDs may impose their own compliance processes, but these are external to the protocol and do not affect base-layer participation.',
      'The network belongs to its participants. This is not a statement of philosophy. It is a description of the technical architecture. No single entity can prevent participation, alter the rules, or control the distribution of newly mined tokens.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function QDsPage() {
  const vel       = useScrollVelocity();
  const [mounted, setMounted] = useState(false);
  const heroRef   = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroTextY  = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpa    = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — full viewport, white background, 3D atom + text overlay
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-white"
        style={{ minHeight: '100svh' }}
      >
        {/* 3D atom — absolute fill */}
        {mounted && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <QDsAtom vel={vel} />
          </div>
        )}

        {/* Top & bottom edge fade so atom bleeds naturally into content */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />

        {/* Text content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpa }}
          className="relative z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none select-none"
          style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}
        >
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-mono text-[10px] md:text-[12px] font-black uppercase tracking-[0.55em] text-black/25 mb-8 block"
          >
            Humanity Ledger · Digital Asset
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="font-black tracking-tighter uppercase leading-[0.82] text-black mb-8"
            style={{ fontSize: 'clamp(80px, 18vw, 200px)' }}
          >
            QDs
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
            className="font-serif text-black/45 max-w-[600px] leading-relaxed"
            style={{ fontSize: 'clamp(17px, 2.2vw, 26px)' }}
          >
            21,000,000 units. Mined, not issued.
            <br className="hidden md:block" />
            Launching before 2027.
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mt-20 flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/20">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-black/15 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS BAND
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-black/[0.06] bg-[#FAFAF8] py-14">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-2 p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/15 transition-colors shadow-sm"
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/30">
                {s.label}
              </span>
              <span className="font-black text-[21px] tracking-tight text-black leading-none">
                {s.value}
              </span>
              <span className="font-mono text-[9px] text-black/38 leading-snug">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONTENT SECTIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[960px] mx-auto px-6 py-28 md:py-40 flex flex-col gap-28 md:gap-40">
        {SECTIONS.map((s, idx) => (
          <motion.article
            key={s.num}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row gap-8 md:gap-20"
          >
            {/* Left col — section number + title */}
            <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-3 pt-1">
              <span className="font-mono text-[10px] font-black text-black/22 tracking-[0.3em]">
                {s.num}
              </span>
              <h2 className="text-[24px] md:text-[30px] font-black tracking-tight leading-[1.1] text-black">
                {s.title}
              </h2>
              <div className="w-9 h-[3px] bg-black rounded-full mt-3" />
            </div>

            {/* Right col — body text */}
            <div className="flex-1 flex flex-col gap-6">
              {s.paragraphs.map((p, pi) => (
                <p
                  key={pi}
                  className="font-serif text-black/62 leading-[1.85]"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 18px)' }}
                >
                  {p}
                </p>
              ))}
            </div>
          </motion.article>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MID-PAGE ATOM DIVIDER — second instance, scroll continues to drive it
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full relative border-y border-black/[0.06] bg-[#FAFAF8] overflow-hidden"
        style={{ height: 'clamp(360px, 50vh, 560px)' }}
      >
        {mounted && (
          <div className="absolute inset-0">
            <QDsAtom vel={vel} />
          </div>
        )}
        {/* edge fades */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FAFAF8] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAFAF8] to-transparent pointer-events-none z-10" />
        {/* center label */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.55em] text-black/18">
            QDs · 21,000,000 · 2026
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA — black section
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-black py-36 px-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* subtle white glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl flex flex-col items-center gap-8"
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-white/22">
            Genesis Block · Before 2027
          </span>

          <h2
            className="font-black tracking-tighter uppercase leading-[0.87] text-white text-balance"
            style={{ fontSize: 'clamp(36px, 7vw, 72px)' }}
          >
            Mining starts soon.
          </h2>

          <p className="font-serif text-white/42 leading-relaxed max-w-xl"
            style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}>
            Open participation. Fixed supply. No exceptions to either rule.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/status"
              className="px-10 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-transform active:scale-95 shadow-xl"
            >
              Network Status
            </Link>
            <Link
              href="/developer"
              className="px-10 py-5 bg-transparent border border-white/18 text-white/70 hover:border-white/40 hover:text-white rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-all active:scale-95"
            >
              Technical Docs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-white border-t border-black/[0.05] py-10 px-6">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-black/28">
            © 2026 Humanity Ledger · QDs Protocol
          </span>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy',   href: '/privacy'   },
              { label: 'Developer', href: '/developer' },
              { label: 'Status',    href: '/status'    },
              { label: 'Legal',     href: '/legal'     },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/28 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
