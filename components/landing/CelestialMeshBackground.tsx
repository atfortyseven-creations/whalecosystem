"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

// ─── iOS SAFE: CelestialMeshBackground ────────────────────────────────────────
// CRITICAL FIX: useScroll() on an overflow:hidden container returns zero-delta
// on iOS Safari (the window doesn't scroll — the snap container does).
// We suppress Framer Motion scroll-driven transforms on touch devices to prevent
// the runtime error + the "frozen background" visual bug.

export function CelestialMeshBackground() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch screens after mount (no SSR window access)
    setIsTouchDevice(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  // Only render the heavy parallax on desktop. On mobile/iOS we use a
  // static version to avoid the useScroll + overflow:hidden crash.
  if (isTouchDevice) {
    return <CelestialMeshStatic />;
  }

  return <CelestialMeshDesktop />;
}

// ─── STATIC VERSION — iOS / Touch devices ─────────────────────────────────────
function CelestialMeshStatic() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      {/* Blob 1 */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.08)_0%,transparent_70%)] blur-[80px]"
      />
      {/* Blob 2 */}
      <motion.div
        animate={{ scale: [1.05, 1, 1.05], x: [0, -20, 0], y: [0, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-[100px]"
      />
      {/* Vignette: Safely reduced from 80% to 40% */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,white_100%)] opacity-40" />
    </div>
  );
}

// ─── PARALLAX VERSION — Desktop only ─────────────────────────────────────────
function CelestialMeshDesktop() {
  const { scrollYProgress } = useScroll();
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  const meshScale   = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.5, 1.8]);
  const meshOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.4, 0.6, 0.4, 0.2]);
  const gridRotateX = useTransform(smoothProgress, [0, 1], [60, 45]);
  const gridY       = useTransform(smoothProgress, [0, 1], ["-20%", "-40%"]);
  const particleStretch = useTransform(smoothProgress, [0, 0.5, 1], [1, 2.5, 1]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white transform-gpu">
      {/* Layer 1: Animated Mesh Gradients */}
      <motion.div style={{ scale: meshScale, opacity: meshOpacity, willChange: 'transform' }} className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.1)_0%,transparent_70%)] blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-[120px]"
        />
      </motion.div>

      {/* Layer 2: Perspective Grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.08]"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%', rotateX: gridRotateX, translateY: gridY }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            transform: 'translate3d(0,0,-200px)',
            transformOrigin: 'top center',
            height: '300%',
            willChange: 'transform',
          }}
        />
      </motion.div>

      {/* Layer 3: Particles — each is its OWN component with its own hooks (iOS-safe) */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLE_SEEDS.map((seed, i) => (
          <Particle key={i} smoothProgress={smoothProgress} stretch={particleStretch} seed={seed} />
        ))}
      </div>

      {/* Layer 4: Geometric Shards */}
      <GeometricShards smoothProgress={smoothProgress} />

      {/* Vignette: Safely reduced from 80% to 40% */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,white_100%)] opacity-40" />
    </div>
  );
}

// Pre-seeded particle data — avoids Math.random() in render which causes
// SSR/hydration mismatches that silently crash iOS Safari WebView
const PARTICLE_SEEDS = [
  { x: 12.4, y: 34.7, speed: 0.42 }, { x: 78.1, y: 12.3, speed: 0.31 },
  { x: 45.6, y: 67.8, speed: 0.55 }, { x: 23.9, y: 89.1, speed: 0.28 },
  { x: 91.3, y: 45.2, speed: 0.47 }, { x: 8.7,  y: 23.5, speed: 0.38 },
  { x: 56.2, y: 78.9, speed: 0.62 }, { x: 34.5, y: 11.4, speed: 0.25 },
  { x: 67.8, y: 56.3, speed: 0.44 }, { x: 82.3, y: 34.1, speed: 0.53 },
  { x: 19.6, y: 91.7, speed: 0.36 }, { x: 73.4, y: 28.6, speed: 0.41 },
  { x: 38.9, y: 62.4, speed: 0.58 }, { x: 51.7, y: 7.9,  speed: 0.33 },
  { x: 4.3,  y: 48.5, speed: 0.49 }, { x: 88.6, y: 73.2, speed: 0.27 },
  { x: 29.1, y: 15.8, speed: 0.61 }, { x: 63.5, y: 92.3, speed: 0.35 },
  { x: 47.2, y: 38.6, speed: 0.46 }, { x: 95.8, y: 59.4, speed: 0.52 },
];

// ─── PARTICLE — own component so hooks are ALWAYS called unconditionally ───────
function Particle({ smoothProgress, stretch, seed }: {
  smoothProgress: MotionValue<number>;
  stretch: MotionValue<number>;
  seed: { x: number; y: number; speed: number };
}) {
  // All hooks at top level — never inside conditionals or loops
  const y       = useTransform(smoothProgress, [0, 1], [`${seed.y}%`, `${seed.y - 30 * seed.speed}%`]);
  const opacity = useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.6, 0.2]);

  return (
    <motion.div
      style={{ left: `${seed.x}%`, top: y, scaleY: stretch, opacity, willChange: 'transform' }}
      className="absolute w-[2px] h-[2px] bg-slate-400 rounded-full blur-[1px]"
    />
  );
}

// ─── GEOMETRIC SHARDS — extracted to avoid hook-in-map violation ──────────────
const SHARD_SEEDS = [
  { top: 20, left: 10, scaleEnd: 1.5,   rotateEnd: 90  },
  { top: 35, left: 30, scaleEnd: 1.6,   rotateEnd: 135 },
  { top: 50, left: 50, scaleEnd: 1.7,   rotateEnd: 180 },
  { top: 65, left: 70, scaleEnd: 1.8,   rotateEnd: 225 },
];

function Shard({ smoothProgress, seed }: { smoothProgress: MotionValue<number>; seed: typeof SHARD_SEEDS[0] }) {
  const scale  = useTransform(smoothProgress, [0, 1], [1, seed.scaleEnd]);
  const rotate = useTransform(smoothProgress, [0, 1], [0, seed.rotateEnd]);
  return (
    <motion.div
      style={{ top: `${seed.top}%`, left: `${seed.left}%`, scale, rotate, willChange: 'transform' }}
      className="absolute border border-black/5 w-48 h-48 rotate-45 flex items-center justify-center opacity-[0.1]"
    >
      <div className="w-full h-px bg-black/5" />
      <div className="h-full w-px bg-black/5 absolute left-1/2" />
    </motion.div>
  );
}

function GeometricShards({ smoothProgress }: { smoothProgress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {SHARD_SEEDS.map((seed, i) => (
        <Shard key={i} smoothProgress={smoothProgress} seed={seed} />
      ))}
    </div>
  );
}
