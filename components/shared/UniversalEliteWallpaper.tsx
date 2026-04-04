"use client";

import React, { useEffect, useRef } from 'react';

export function UniversalEliteWallpaper() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // desynchronized: true → canvas updates off the main thread on supporting browsers
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        if (!ctx) return;

        let width  = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        // ── Device detection ─────────────────────────────────────────────────
        // Chrome "Desktop Mode" on mobile still runs on mobile GPU/CPU, so we
        // detect the real hardware via User-Agent, not window width.
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        // High-DPR (Retina) screens cost 4× the fill-rate. Cap render scale to 0.5×
        // on mobile and let CSS scale up — imperceptible for a background layer.
        const dpr         = window.devicePixelRatio || 1;
        const renderScale = isMobile ? Math.min(0.5, 1 / dpr) : Math.min(1, 1 / dpr * 2);

        // Fewer nodes = fewer O(n²) edge checks per frame
        const NODE_COUNT = isMobile ? 18 : 55;
        const MAX_DIST   = isMobile ? 120 : 220;

        // ── Canvas sizing ─────────────────────────────────────────────────────
        const resize = () => {
            width  = window.innerWidth;
            height = window.innerHeight;
            canvas.width  = Math.floor(width  * renderScale);
            canvas.height = Math.floor(height * renderScale);
            canvas.style.width  = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        };
        window.addEventListener('resize', resize);
        resize();

        // ── Particle nodes ────────────────────────────────────────────────────
        interface CircuitNode { x: number; y: number; vx: number; vy: number; }
        const nodes: CircuitNode[] = Array.from({ length: NODE_COUNT }, () => ({
            x:  Math.random() * width,
            y:  Math.random() * height,
            vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.45),
            vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.45),
        }));

        // ── Static grid — drawn ONCE onto an offscreen canvas ─────────────────
        // Blitting a pre-rendered image is orders of magnitude cheaper than
        // re-stroking hundreds of <moveTo/lineTo> calls every frame.
        const gridCanvas = document.createElement('canvas');
        const buildGrid  = () => {
            gridCanvas.width  = Math.floor(width  * renderScale);
            gridCanvas.height = Math.floor(height * renderScale);
            const gCtx = gridCanvas.getContext('2d')!;
            gCtx.scale(renderScale, renderScale);
            gCtx.strokeStyle = 'rgba(212,255,43,0.04)';
            gCtx.lineWidth   = 0.5;
            const step = isMobile ? 80 : 60;
            for (let x = 0; x < width;  x += step) {
                gCtx.beginPath(); gCtx.moveTo(x, 0); gCtx.lineTo(x, height); gCtx.stroke();
            }
            for (let y = 0; y < height; y += step) {
                gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(width, y); gCtx.stroke();
            }
        };
        buildGrid();
        window.addEventListener('resize', buildGrid);

        // ── Frame throttling ──────────────────────────────────────────────────
        // On a 240 Hz monitor requestAnimationFrame fires 240×/s.
        // Our particle background only needs ~20 fps to look smooth.
        // This single check saves ≈ 90 % of all animation CPU time.
        const TARGET_FPS     = isMobile ? 18 : 28;
        const FRAME_INTERVAL = 1000 / TARGET_FPS;
        let lastTime = 0;

        // ── Draw loop ─────────────────────────────────────────────────────────
        const draw = (ts: number) => {
            animationFrameId = requestAnimationFrame(draw);

            const delta = ts - lastTime;
            if (delta < FRAME_INTERVAL) return;           // ← skip frame
            lastTime = ts - (delta % FRAME_INTERVAL);

            // Background fill
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // Blit pre-rendered grid (zero stroke cost)
            ctx.drawImage(gridCanvas, 0, 0, width, height);

            // Pulse glow — low-frequency sin keeps it subtle
            const pa = (Math.sin(ts / 2500) * 0.015) + 0.025;
            const glow = ctx.createRadialGradient(
                width / 2, height * 0.3, 0,
                width / 2, height * 0.3, width * 0.6
            );
            glow.addColorStop(0, `rgba(255,45,244,${pa})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            // Particle mesh — O(n²) but n is small (18 or 55)
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > width)  n.vx *= -1;
                if (n.y < 0 || n.y > height)  n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212,255,43,0.30)';
                ctx.fill();

                for (let j = i + 1; j < nodes.length; j++) {
                    const o    = nodes[j];
                    const dx   = n.x - o.x;
                    const dy   = n.y - o.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(o.x, o.y);
                        ctx.strokeStyle = `rgba(212,255,43,${0.12 * (1 - dist / MAX_DIST)})`;
                        ctx.lineWidth   = 0.6;
                        ctx.stroke();
                    }
                }
            }
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('resize', buildGrid);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const isMobileSSR = typeof window !== 'undefined'
        ? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        : false;

    const [pathname, setPathname] = React.useState('');
    React.useEffect(() => { setPathname(window.location.pathname); }, []);

    return (
        <>
            {/* GPU-composited canvas — will-change keeps it on its own layer */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-[-2] outline-none border-none m-0 p-0 block will-change-transform"
                style={{ imageRendering: 'pixelated' }}
            />
            {/* Static watermark — suppressed on landing page to avoid flash */}
            {pathname !== '/' && (
                <div
                    className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.04]"
                    style={{
                        backgroundImage: 'url(/official-whale-legendary.png)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: isMobileSSR ? '50px' : '70px',
                        filter: 'grayscale(1) brightness(1.2)',
                        transform: 'translate3d(0,0,0)',
                    }}
                />
            )}
        </>
    );
}
