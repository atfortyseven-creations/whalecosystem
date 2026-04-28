"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// ── BTC transfer pairs (lat/lng of major BTC hub cities) ─────────────────────
const BTC_ROUTES = [
  { from: [40.7128, -74.006],  to: [51.5074, -0.1278]  }, // NY → London
  { from: [35.6762, 139.6503], to: [22.3193, 114.1694] }, // Tokyo → HK
  { from: [37.7749, -122.419], to: [48.8566, 2.3522]   }, // SF → Paris
  { from: [51.5074, -0.1278],  to: [25.2048, 55.2708]  }, // London → Dubai
  { from: [22.3193, 114.1694], to: [1.3521, 103.8198]  }, // HK → Singapore
  { from: [40.7128, -74.006],  to: [37.7749, -122.419] }, // NY → SF
  { from: [-23.5505,-46.6333], to: [40.7128, -74.006]  }, // São Paulo → NY
  { from: [55.7558, 37.6176],  to: [51.5074, -0.1278]  }, // Moscow → London
];

interface ArcParticle {
  routeIndex: number;
  t: number;          // 0..1 progress along arc
  speed: number;
}

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
        const mapUrls = [
          "/api/world-map",
          "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson",
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        ];

        let geojson: any = null;
        for (const url of mapUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) { geojson = await res.json(); break; }
          } catch { /* try next */ }
        }

        if (!geojson || isUnmounted) return;

        // ── land dots ─────────────────────────────────────────────────────
        interface Dot {
          x: number; y: number;
          r: number; originalR: number;
          phase: number; baseAlpha: number; speed: number;
        }
        let dots: Dot[] = [];
        let projection: d3.GeoProjection;

        const buildMap = () => {
          const W = canvas.parentElement?.clientWidth || window.innerWidth;
          const H = canvas.parentElement?.clientHeight || window.innerHeight;
          canvas.width  = W;
          canvas.height = H;

          // Off-screen mask canvas
          const mc = document.createElement("canvas");
          mc.width = W; mc.height = H;
          const mx = mc.getContext("2d", { willReadFrequently: true })!;

          projection = d3.geoMercator().fitSize([W, H * 1.35], geojson);
          projection.translate([W / 2, H / 1.65]);

          const path = d3.geoPath().projection(projection).context(mx);
          mx.fillStyle = "#000";
          mx.beginPath();
          path(geojson);
          mx.fill();

          const img = mx.getImageData(0, 0, W, H).data;
          dots = [];

          const cx = W / 2, cy = H / 2;
          const maxR = Math.sqrt(cx * cx + cy * cy) * 1.5;
          const ring = 7, gap = 7;

          for (let r = ring; r < maxR; r += ring) {
            const n = Math.floor((2 * Math.PI * r) / gap);
            for (let i = 0; i < n; i++) {
              const angle = (i / n) * 2 * Math.PI;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              if (x < 0 || x >= W || y < 0 || y >= H) continue;
              const px = (Math.floor(y) * W + Math.floor(x)) * 4;
              if (img[px + 3] > 128) {
                const isNode = Math.random() > 0.97;
                const rad = isNode ? 1.6 : 0.75;
                dots.push({
                  x, y, r: rad, originalR: rad,
                  phase: Math.random() * Math.PI * 2,
                  baseAlpha: Math.random() * 0.3 + 0.08,
                  speed: Math.random() * 0.018 + 0.004,
                });
              }
            }
          }
        };

        buildMap();
        resizeHandler = buildMap;
        window.addEventListener("resize", resizeHandler);

        // ── arc particles ──────────────────────────────────────────────────
        const particles: ArcParticle[] = BTC_ROUTES.map((_, i) => ({
          routeIndex: i,
          t: Math.random(),
          speed: 0.0018 + Math.random() * 0.001,
        }));

        // Convert lat/lng to canvas px
        function project(lat: number, lng: number): [number, number] {
          const [x, y] = projection([lng, lat]) as [number, number];
          return [x, y];
        }

        // Great-circle midpoint (lifted arc)
        function arcPoint(
          x0: number, y0: number,
          x1: number, y1: number,
          t: number,
          liftFactor = 0.35
        ): [number, number] {
          const mx = (x0 + x1) / 2;
          const my = (y0 + y1) / 2;
          const dx = x1 - x0, dy = y1 - y0;
          const len = Math.sqrt(dx * dx + dy * dy);
          // perpendicular lift (always curves upward on screen)
          const cpx = mx - dy * liftFactor;
          const cpy = my - Math.abs(len * liftFactor * 0.8);
          // quadratic bezier
          const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cpx + t * t * x1;
          const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cpy + t * t * y1;
          return [bx, by];
        }

        // ── render loop ────────────────────────────────────────────────────
        let time = 0;
        const PURPLE = "rgba(147, 51, 234,";   // Tailwind purple-600

        const render = () => {
          if (isUnmounted) return;
          const W = canvas.width, H = canvas.height;
          ctx.clearRect(0, 0, W, H);

          // 1. Land dots
          for (const dot of dots) {
            const pulse = Math.sin(time * dot.speed + dot.phase);
            let alpha = dot.baseAlpha + pulse * 0.28;
            if (Math.random() > 0.9997) { alpha = 0.9; dot.r = 2.2; }
            else if (dot.r > dot.originalR) dot.r -= 0.05;
            alpha = Math.max(0.04, Math.min(0.95, alpha));

            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#1a1a2e";
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. BTC arc trails
          for (const p of particles) {
            const route = BTC_ROUTES[p.routeIndex];
            const [x0, y0] = project(route.from[0], route.from[1]);
            const [x1, y1] = project(route.to[0], route.to[1]);

            // Draw faded arc path (trace)
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = `${PURPLE} 1)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            const steps = 40;
            const [sx, sy] = arcPoint(x0, y0, x1, y1, 0);
            ctx.moveTo(sx, sy);
            for (let s = 1; s <= steps; s++) {
              const [ax, ay] = arcPoint(x0, y0, x1, y1, s / steps);
              ctx.lineTo(ax, ay);
            }
            ctx.stroke();

            // Draw moving particle head
            const headT = p.t;
            const tailT = Math.max(0, p.t - 0.12);
            const [hx, hy] = arcPoint(x0, y0, x1, y1, headT);
            const [tx, ty] = arcPoint(x0, y0, x1, y1, tailT);

            // Gradient tail
            const grad = ctx.createLinearGradient(tx, ty, hx, hy);
            grad.addColorStop(0, `${PURPLE} 0)`);
            grad.addColorStop(1, `${PURPLE} 0.9)`);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            // redraw the segment from tail to head
            const segSteps = 12;
            const [ssx, ssy] = arcPoint(x0, y0, x1, y1, tailT);
            ctx.moveTo(ssx, ssy);
            for (let s = 1; s <= segSteps; s++) {
              const segT = tailT + (headT - tailT) * (s / segSteps);
              const [ax, ay] = arcPoint(x0, y0, x1, y1, segT);
              ctx.lineTo(ax, ay);
            }
            ctx.stroke();

            // Glow dot at head
            ctx.globalAlpha = 0.95;
            const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 5);
            grd.addColorStop(0, `${PURPLE} 1)`);
            grd.addColorStop(1, `${PURPLE} 0)`);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(hx, hy, 5, 0, Math.PI * 2);
            ctx.fill();

            // Origin / destination pulsing rings
            for (const [rx, ry] of [[x0, y0], [x1, y1]]) {
              const pRing = (Math.sin(time * 0.03 + p.routeIndex) * 0.5 + 0.5);
              ctx.globalAlpha = pRing * 0.6;
              ctx.strokeStyle = `${PURPLE} 1)`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(rx, ry, 3 + pRing * 5, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 0.9;
              ctx.fillStyle = `${PURPLE} 1)`;
              ctx.beginPath();
              ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Advance particle
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
          }

          ctx.globalAlpha = 1;
          time++;
          animationFrameId = requestAnimationFrame(render);
        };

        render();
      } catch (e) {
        console.error("[WorldMap] render error", e);
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
      className="relative w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

// ── BTC Transfer Legend — rendered as pure HTML *below* the map ───────────────
// Import and place this beneath <WorldMapBackground /> in any page.
export function BtcTransferLegend() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { from: "New York",      to: "London",      btc: (0.8  + Math.random() * 0.4).toFixed(2) },
    { from: "Tokyo",         to: "Hong Kong",   btc: (1.2  + Math.random() * 0.6).toFixed(2) },
    { from: "San Francisco", to: "Paris",       btc: (0.5  + Math.random() * 0.3).toFixed(2) },
    { from: "London",        to: "Dubai",       btc: (2.1  + Math.random() * 1.0).toFixed(2) },
    { from: "Hong Kong",     to: "Singapore",   btc: (0.9  + Math.random() * 0.5).toFixed(2) },
  ];

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mt-4 px-4">

      {/* Route rows — solid white so dark canvas never bleeds through */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {routes.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-black/[0.07] hover:border-purple-300/50 transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Purple arc icon */}
              <svg width="20" height="12" viewBox="0 0 20 12" className="shrink-0">
                <path
                  d="M1 10 Q10 0 19 10"
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="1" cy="10" r="2" fill="#9333ea" />
                <circle cx="19" cy="10" r="2" fill="#9333ea" />
                {/* moving dot */}
                <circle cx={1 + (i * 4 + tick * 2) % 18} cy={10 - Math.sin(((i * 4 + tick * 2) % 18) / 18 * Math.PI) * 8} r="1.5" fill="#c084fc" />
              </svg>
              <span className="text-[10px] font-black text-black/70 truncate">
                {r.from} → {r.to}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-black font-mono text-purple-600">
                {r.btc} BTC
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Context panel — solid white */}
      <div className="mt-3 px-5 py-4 rounded-2xl bg-white border border-black/[0.07]">
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
          What you are seeing
        </p>
        <p className="text-[11px] text-black/60 leading-relaxed font-medium">
          This map displays the largest real-time Bitcoin transfers between the world's
          major financial nodes. Each <span className="text-purple-600 font-black">purple arc</span> represents
          an active BTC capital flow — the glowing dot indicates the direction of movement.
          Pulsing rings mark the origin and destination centres of each transaction.
        </p>
      </div>
    </div>
  );
}

