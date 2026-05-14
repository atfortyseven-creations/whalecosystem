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
      return; // Do not initialize on mobile
    }

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;

    // Telemetry Cursor Variables
    let mouseX = -1000;
    let mouseY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isActive = false;

    // The size is "almost the size of the cursor" -> standard cursor is ~24px, we make it ~32px with a glow.
    const RADIUS = 14; 
    const GLOW_RADIUS = 32;

    const initGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isActive) {
        currentX = mouseX;
        currentY = mouseY;
        isActive = true;
      }
    };

    const handleMouseLeave = () => {
      isActive = false;
    };

    window.addEventListener("resize", initGrid);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    initGrid();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isActive) {
        // High precision telemetry interpolation (zero-latency feel but smooth)
        currentX += (mouseX - currentX) * 0.45;
        currentY += (mouseY - currentY) * 0.45;

        // Draw perfect purple glow
        const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, GLOW_RADIUS);
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.8)"); // Vivid Purple center
        gradient.addColorStop(0.4, "rgba(139, 92, 246, 0.3)");
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = "rgba(167, 139, 250, 1)";
        ctx.beginPath();
        ctx.arc(currentX, currentY, RADIUS, 0, Math.PI * 2);
        ctx.fill();
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
      // z-[0] or z-[-1] to ensure it stays BEHIND the interactive content
      // mix-blend-screen for that beautiful luminous purple effect over the background
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen opacity-90"
      style={{
           display: "block",
           transform: "translateZ(0)", 
           willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
