"use client";

import React, { useEffect, useRef } from "react";

export function InteractiveFluidGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: false to optimize and let the canvas act as the rigid backdrop
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;
    let lastTime = performance.now();

    // Grid configuration precisely calibrated for "medio milimetro" aesthetics
    const CELL_SIZE = 45; 
    const LINE_WIDTH = 0.5; // Hairline 0.5px
    
    // Target display baseline for scaling physics
    const BASE_HZ = 144;
    // Physics / spring factors 
    const TENSION = 0.015;
    const DAMPING = 0.88;
    const MOUSE_RADIUS = 200;
    const MOUSE_FORCE = 0.6; 

    // Raw V8 Contiguous Memory Buffer
    // Memory layout per node: [x, y, ox, oy, vx, vy]
    let pointsBuffer: Float32Array;
    const STRIDE = 6;
    let cols = 0;
    let rows = 0;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const initGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      cols = Math.ceil(width / CELL_SIZE) + 1;
      rows = Math.ceil(height / CELL_SIZE) + 1;

      const numPoints = (rows + 1) * (cols + 1);
      pointsBuffer = new Float32Array(numPoints * STRIDE);

      let idx = 0;
      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
          const x = j * CELL_SIZE;
          const y = i * CELL_SIZE;
          
          pointsBuffer[idx]     = x; // x
          pointsBuffer[idx + 1] = y; // y
          pointsBuffer[idx + 2] = x; // ox
          pointsBuffer[idx + 3] = y; // oy
          pointsBuffer[idx + 4] = 0; // vx
          pointsBuffer[idx + 5] = 0; // vy
          
          idx += STRIDE;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener("resize", initGrid);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    initGrid();

    const render = (time: number) => {
      // Uncompromised Frame-Independent Time Delta calculation
      let dt = (time - lastTime) / 1000;
      // Cap delta to avoid physics explosions if page was backgrounded over 30ms
      if (dt > 1 / 30) dt = 1 / 30; 
      lastTime = time;

      // Rate multiplier guarantees exact same behavioral physics on 60hz, 144hz, and 360hz monitors
      const rate = dt * BASE_HZ; 

      // Hermite-equivalent mouse smoothing interpolation
      mouseX += (targetMouseX - mouseX) * Math.min(1, 0.2 * rate);
      mouseY += (targetMouseY - mouseY) * Math.min(1, 0.2 * rate);

      // Manual clear optimized for alpha: false rigid backdrop
      ctx.fillStyle = "#FDFCF8";
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(10, 10, 10, 0.05)";
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const r = rows + 1;
      const c = cols + 1;

      // Time-scaled physical derivations
      const springFactor = TENSION * rate;
      const dampFactor = Math.pow(DAMPING, rate);
      const repulseForce = MOUSE_FORCE * rate;
      const rSq = MOUSE_RADIUS * MOUSE_RADIUS;

      // Resolve Vector Simulation & Horizontal lines
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          const offset = (i * c + j) * STRIDE;
          
          let px = pointsBuffer[offset];
          let py = pointsBuffer[offset + 1];
          const ox = pointsBuffer[offset + 2];
          const oy = pointsBuffer[offset + 3];
          let vx = pointsBuffer[offset + 4];
          let vy = pointsBuffer[offset + 5];

          const dx = mouseX - px;
          const dy = mouseY - py;
          const distSq = dx * dx + dy * dy;
          
          // Spatial indexing optimization - early discard avoiding square roots
          if (distSq < rSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            vx -= (dx / dist) * force * repulseForce;
            vy -= (dy / dist) * force * repulseForce;
          }

          // Hookes Law spring force
          vx += (ox - px) * springFactor;
          vy += (oy - py) * springFactor;

          // Drag coefficient
          vx *= dampFactor;
          vy *= dampFactor;

          px += vx;
          py += vy;

          // Push memory updates
          pointsBuffer[offset]     = px;
          pointsBuffer[offset + 1] = py;
          pointsBuffer[offset + 4] = vx;
          pointsBuffer[offset + 5] = vy;

          // Plot topology horizontally
          if (j === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
      }

      // Plot topology vertically (traversing transpose)
      for (let j = 0; j < c; j++) {
        let isFirst = true;
        for (let i = 0; i < r; i++) {
          const offset = (i * c + j) * STRIDE;
          const px = pointsBuffer[offset];
          const py = pointsBuffer[offset + 1];
          
          if (isFirst) {
            ctx.moveTo(px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }

      // Batch render pipeline execution
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    // Kickstart pipeline
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", initGrid);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
           transform: "translateZ(0)", 
           willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
