"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * OmniMatrixCanvas — Epicentro 2: 2D Institutional Visualizer
 * ═══════════════════════════════════════════════════════════════
 * Pure HTML5 Canvas 2D implementation. Zero WebGL / Three.js.
 * Zero external dependencies. Runs on any device, any browser.
 *
 * Architecture:
 *  - requestAnimationFrame loop at native vsync (60–120 FPS)
 *  - 800 particles simulated entirely on the main canvas
 *  - Zustand store polled imperatively inside rAF — zero React re-renders
 *  - Particles form constellations: proximity edges drawn between nodes < threshold
 *  - Intensity from whale event count modulates speed + brightness in real time
 *  - GPU composite: willChange + translateZ to push canvas to own compositor layer
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useRef, useEffect } from 'react';
import { useVIPStore } from '@/lib/vip-store';

// ── Config ──────────────────────────────────────────────────────────────────
const PARTICLE_COUNT    = 800;
const EDGE_THRESHOLD    = 90;   // px — max distance for drawing a constellation edge
const BASE_SPEED        = 0.18;
const GOLD              = { r: 212, g: 175, b: 55 };
const DIM               = { r: 30,  g: 40,  b: 60  };

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  isHot: boolean; // gold node vs dim node
  phase: number;  // individual flicker phase offset
}

function initParticles(w: number, h: number): Particle[] {
  const arr: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isHot = Math.random() > 0.82;
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (0.5 + Math.random() * 0.5);
    arr.push({
      x:      Math.random() * w,
      y:      Math.random() * h,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed,
      radius: isHot ? 1.8 + Math.random() * 1.4 : 0.9 + Math.random() * 0.8,
      isHot,
      phase:  Math.random() * Math.PI * 2,
    });
  }
  return arr;
}

export function OmniMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{
    particles: Particle[];
    raf: number;
    t: number;
  }>({ particles: [], raf: 0, t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Size canvas to its container
    const observer = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        canvas.width  = Math.floor(width  * (window.devicePixelRatio || 1));
        canvas.height = Math.floor(height * (window.devicePixelRatio || 1));
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        stateRef.current.particles = initParticles(width, height);
      }
    });
    observer.observe(canvas.parentElement!);

    // Initial particles
    const w = canvas.parentElement!.clientWidth;
    const h = canvas.parentElement!.clientHeight;
    canvas.width  = Math.floor(w * (window.devicePixelRatio || 1));
    canvas.height = Math.floor(h * (window.devicePixelRatio || 1));
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    stateRef.current.particles = initParticles(w, h);

    // ── rAF render loop ────────────────────────────────────────────────────
    function tick() {
      stateRef.current.raf = requestAnimationFrame(tick);
      const s = stateRef.current;
      s.t += 0.016;

      const cw = canvas!.width  / (window.devicePixelRatio || 1);
      const ch = canvas!.height / (window.devicePixelRatio || 1);

      // ── Read whale store imperatively (zero React re-render) ───────────
      const events    = useVIPStore.getState().whaleEvents ?? [];
      const intensity = Math.min(events.length / 400, 1.0);
      const speedMult = 1.0 + intensity * 1.8;

      // ── Background clear ───────────────────────────────────────────────
      ctx!.fillStyle = '#020202';
      ctx!.fillRect(0, 0, cw, ch);

      // ── Update positions ──────────────────────────────────────────────
      for (const p of s.particles) {
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
        // Wrap around screen edges (toroidal topology)
        if (p.x < 0)   p.x += cw;
        if (p.x > cw)  p.x -= cw;
        if (p.y < 0)   p.y += ch;
        if (p.y > ch)  p.y -= ch;
      }

      // ── Draw constellation edges ───────────────────────────────────────
      // Only compare each pair once: O(n²/2) — acceptable for 800 nodes
      const edgeAlpha = 0.06 + intensity * 0.2;
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < s.particles.length; i++) {
        const pi = s.particles[i];
        for (let j = i + 1; j < s.particles.length; j++) {
          const pj = s.particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_THRESHOLD) {
            const alpha = edgeAlpha * (1 - dist / EDGE_THRESHOLD);
            // Gold edge if both are hot, else dim
            if (pi.isHot && pj.isHot) {
              ctx!.strokeStyle = `rgba(212,175,55,${alpha})`;
            } else {
              ctx!.strokeStyle = `rgba(80,120,180,${alpha * 0.6})`;
            }
            ctx!.beginPath();
            ctx!.moveTo(pi.x, pi.y);
            ctx!.lineTo(pj.x, pj.y);
            ctx!.stroke();
          }
        }
      }

      // ── Draw particles ────────────────────────────────────────────────
      for (const p of s.particles) {
        // Flicker: each particle has individual phase
        const flicker = 0.6 + 0.4 * Math.sin(s.t * 2.4 + p.phase);
        const glow    = p.isHot ? 0.55 + intensity * 0.45 : 0.18;
        const alpha   = flicker * glow;

        if (p.isHot) {
          // Gold glow: two concentric circles
          const glowR = p.radius * (3 + intensity * 3);
          const grad  = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${alpha})`);
          grad.addColorStop(1, 'rgba(212,175,55,0)');
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx!.fill();

          // Core dot
          ctx!.fillStyle = `rgba(255,230,100,${Math.min(alpha * 1.5, 1)})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // Dim blue node
          ctx!.fillStyle = `rgba(${DIM.r},${DIM.g},${DIM.b},${alpha})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // ── Radial vignette overlay ───────────────────────────────────────
      const vignette = ctx!.createRadialGradient(
        cw / 2, ch / 2, cw * 0.25,
        cw / 2, ch / 2, cw * 0.85
      );
      vignette.addColorStop(0, 'rgba(2,2,2,0)');
      vignette.addColorStop(1, 'rgba(2,2,2,0.82)');
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, cw, ch);

      // ── Live stats HUD ────────────────────────────────────────────────
      ctx!.font = '9px "Roboto Mono", monospace';
      ctx!.fillStyle = 'rgba(212,175,55,0.45)';
      ctx!.fillText(`WHALE MESH · ${events.length} EVT · INT ${(intensity * 100).toFixed(0)}%`, 12, ch - 12);
    }

    tick();

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[0] overflow-hidden bg-[#020202]"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
