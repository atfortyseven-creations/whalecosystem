"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function CelestialMeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-performance scroll tracking
  const { scrollYProgress } = useScroll();
  
  // Spring config for 240Hz buttery smoothness
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Parallax and Warp Transforms (GPU Optimized)
  const meshScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.5, 1.8]);
  const meshOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.4, 0.6, 0.4, 0.2]);
  const gridRotateX = useTransform(smoothProgress, [0, 1], [60, 45]);
  const gridY = useTransform(smoothProgress, [0, 1], ["-20%", "-40%"]);
  
  // Warping effect for particles (stretching on scroll)
  const particleStretch = useTransform(smoothProgress, [0, 0.5, 1], [1, 2.5, 1]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden bg-white transform-gpu">
      {/* Layer 1: Animated Mesh Gradients (GPU Accelerated) */}
      <motion.div 
        style={{ scale: meshScale, opacity: meshOpacity }}
        className="absolute inset-0 will-change-transform"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.1)_0%,transparent_70%)] blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-[120px]"
        />
      </motion.div>

      {/* Layer 2: Forensic Perspective Grid */}
      <motion.div 
        className="absolute inset-0 opacity-[0.08]" 
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          rotateX: gridRotateX,
          translateY: gridY
        }}
      >
        <div 
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            transform: 'translate3d(0,0, -200px)',
            transformOrigin: 'top center',
            height: '300%'
          }}
        />
      </motion.div>

      {/* Layer 3: Celestial Particles (Warping enabled) - Darker for visibility */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} smoothProgress={smoothProgress} stretch={particleStretch} index={i} />
        ))}
      </div>

      {/* Layer 4: Distant Geometric Shards */}
      <div className="absolute inset-0 pointer-events-none">
         {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
                scale: useTransform(smoothProgress, [0, 1], [1, 1.5 + (i * 0.1)]),
                rotate: useTransform(smoothProgress, [0, 1], [0, 90 + (i * 45)])
              }}
              className="absolute border border-black/5 w-48 h-48 rotate-45 flex items-center justify-center opacity-[0.1] will-change-transform"
            >
                <div className="w-full h-px bg-black/5" />
                <div className="h-full w-px bg-black/5 absolute left-1/2" />
            </motion.div>
         ))}
      </div>

      {/* Vignette - Inverted */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,white_100%)] opacity-80" />
    </div>
  );
}

function Particle({ smoothProgress, stretch, index }: { smoothProgress: any, stretch: any, index: number }) {
  const initialX = useRef(Math.random() * 100);
  const initialY = useRef(Math.random() * 100);
  const speed = useRef(0.2 + Math.random() * 0.5);
  
  // Parallax Y for particles
  const y = useTransform(smoothProgress, [0, 1], [`${initialY.current}%`, `${initialY.current - (30 * speed.current)}%`]);

  return (
    <motion.div
      style={{ 
        left: `${initialX.current}%`,
        top: y,
        scaleY: stretch,
        opacity: useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.6, 0.2])
      }}
      className="absolute w-[2px] h-[2px] bg-slate-400 rounded-full blur-[1px] will-change-transform"
    />
  );
}
