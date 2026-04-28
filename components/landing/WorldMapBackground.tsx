"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export function WorldMapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let resizeHandler: () => void;
    let isUnmounted = false;

    const init = async () => {
      try {
        // Priority 1: Local server-side proxy (no CSP issues, cached 24h)
        // Priority 2: CDN fallbacks (in case server proxy fails)
        const mapUrls = [
          "/api/world-map",
          "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson",
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        ];

        let geojson = null;
        for (const url of mapUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              geojson = await res.json();
              break;
            }
          } catch {
            // Try next source
          }
        }

        if (!geojson) {
          console.warn("[WorldMap] All map sources failed — map will not render.");
          return;
        }

        if (isUnmounted) return;


        let dots: { x: number; y: number; r: number; phase: number; baseAlpha: number; speed: number; originalR: number }[] = [];
        let time = 0;

        const generateMap = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          canvas.width = width;
          canvas.height = height;

          // 1. Create hidden canvas for mask
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
          if (!maskCtx) return;

          // 2. Setup D3 Projection (Mercator or Equirectangular)
          // We scale the map so it fits nicely on screen
          const projection = d3.geoMercator().fitSize([width, height * 1.4], geojson as any);
          // Translate to adjust vertical centering
          projection.translate([width / 2, height / 1.6]);
          
          const pathGenerator = d3.geoPath().projection(projection).context(maskCtx);

          // 3. Draw map silhouette
          maskCtx.fillStyle = "#000000";
          maskCtx.beginPath();
          pathGenerator(geojson as any);
          maskCtx.fill();

          // 4. Sample the mask using concentric circles
          const imageData = maskCtx.getImageData(0, 0, width, height).data;
          dots = [];

          // Center of the concentric circles (approximate Europe/Africa center to match typical map aesthetic)
          const centerX = width / 2;
          const centerY = height / 2;

          const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 1.5;
          const ringSpacing = 7; // Distance between rings
          const dotSpacing = 7; // Distance between dots on the ring

          for (let r = ringSpacing; r < maxRadius; r += ringSpacing) {
            const circumference = 2 * Math.PI * r;
            const numDots = Math.floor(circumference / dotSpacing);
            
            for (let i = 0; i < numDots; i++) {
              const angle = (i / numDots) * 2 * Math.PI;
              const x = centerX + r * Math.cos(angle);
              const y = centerY + r * Math.sin(angle);

              if (x >= 0 && x < width && y >= 0 && y < height) {
                // Check if this point is over "land" (black pixel in the mask)
                const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
                const alpha = imageData[pixelIndex + 3];

                if (alpha > 128) {
                  // It's land! Add a dot.
                  const isNode = Math.random() > 0.95;
                  const radius = isNode ? 1.5 : 0.8;
                  dots.push({
                    x,
                    y,
                    r: radius,
                    originalR: radius,
                    phase: Math.random() * Math.PI * 2,
                    baseAlpha: Math.random() * 0.4 + 0.1, // Base opacity
                    speed: Math.random() * 0.02 + 0.005,
                  });
                }
              }
            }
          }
        };

        generateMap();

        resizeHandler = () => {
          generateMap();
        };
        window.addEventListener("resize", resizeHandler);

        // 5. Animation loop
        const render = () => {
          if (isUnmounted) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw dots
          for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            
            // Pulsing opacity
            const pulse = Math.sin(time * dot.speed + dot.phase);
            let finalAlpha = dot.baseAlpha + pulse * 0.3;
            
            // Random flashes to simulate network activity
            if (Math.random() > 0.9995) {
                finalAlpha = 1; // Flash!
                dot.r = 2.5; // Temporary size bump
            } else if (dot.r > dot.originalR) {
                dot.r -= 0.05; // Restore size smoothly
            }

            finalAlpha = Math.max(0.05, Math.min(1, finalAlpha));

            ctx.globalAlpha = finalAlpha;
            ctx.fillStyle = "#050505"; // Pure Black dots
            
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
            ctx.fill();
          }

          time++;
          animationFrameId = requestAnimationFrame(render);
        };

        render();

      } catch (e) {
        console.error("Failed to load map data for background", e);
      }
    };

    init();

    return () => {
      isUnmounted = true;
      cancelAnimationFrame(animationFrameId);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.18 }}
    />
  );
}
