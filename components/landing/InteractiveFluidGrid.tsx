"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function InteractiveFluidGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.innerWidth < 768) {
      return; // Do not initialize heavy rAF grid on mobile
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;
    let lastTime = performance.now();

    // Configuración para el "Minecraft pixel blur" estilo Letta Code
    const CELL_SIZE = 18; // Tamaño de píxel más ajustado a Letta Code
    const BASE_HZ = 144;
    const DAMPING = 0.95; // Los píxeles tardan un poco más en desaparecer para dejar rastro
    const MOUSE_RADIUS = 56; // Reducido un 20% para mayor precisión

    // Buffer [alpha], un solo valor por celda
    let alphaBuffer: Float32Array;
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

      cols = Math.ceil(width / CELL_SIZE);
      rows = Math.ceil(height / CELL_SIZE);

      const numCells = rows * cols;
      alphaBuffer = new Float32Array(numCells);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      // Dejar de inyectar fuerza cuando el mouse sale
      targetMouseX = -1000;
      targetMouseY = -1000;
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("resize", initGrid);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    initGrid();

    const render = (time: number) => {
      let dt = (time - lastTime) / 1000;
      if (dt > 1 / 30) dt = 1 / 30; 
      lastTime = time;

      const rate = dt * BASE_HZ; 

      if (targetMouseX > -1000) {
        mouseX += (targetMouseX - mouseX) * Math.min(1, 0.4 * rate);
        mouseY += (targetMouseY - mouseY) * Math.min(1, 0.4 * rate);
      }

      // En lugar de tapar todo con solid fill #FDFCF8, limpiamos el canvas 
      // para que el efecto overlay actúe por encima de todos los elementos (mix-blend-multiply)
      ctx.clearRect(0, 0, width, height);

      const dampFactor = Math.pow(DAMPING, rate);
      const rSq = MOUSE_RADIUS * MOUSE_RADIUS;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const idx = i * cols + j;
          let alpha = alphaBuffer[idx];

          const cx = j * CELL_SIZE + CELL_SIZE / 2;
          const cy = i * CELL_SIZE + CELL_SIZE / 2;

          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const distSq = dx * dx + dy * dy;

          if (distSq < rSq && targetMouseX > -1000) {
            const dist = Math.sqrt(distSq);
            // Ruido para darle el efecto de pixeles dispares (Letta style)
            const noise = Math.random() * 0.6 + 0.4;
            const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * noise;
            alpha += force * 0.3 * rate; 
          }

          alpha *= dampFactor;
          if (alpha > 1) alpha = 1;
          if (alpha < 0.05) alpha = 0;

          alphaBuffer[idx] = alpha;

          if (alpha > 0) {
            // Color morado vibrante tipo Letta Code con stroke omitido para que se vean como bloques limpios
            // Hacemos que los bloques tengan más opacidad pero sin ser totalmente sólidos para el blur
            ctx.fillStyle = `rgba(113, 88, 226, ${alpha * 0.6})`;
            ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", initGrid);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[50] mix-blend-multiply"
      style={{
           display: "block",
           transform: "translateZ(0)", 
           willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
