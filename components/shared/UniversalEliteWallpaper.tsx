"use client";

import React, { useEffect, useRef } from 'react';

export function UniversalEliteWallpaper() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resize);
        resize();

        interface CircuitNode {
            x: number;
            y: number;
            vx: number;
            vy: number;
        }

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const nodes: CircuitNode[] = [];
        const NODE_COUNT = isMobile ? 35 : 70; // High individual density
        const MAX_DIST = isMobile ? 150 : 250;

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
                vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5)
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            
            // ── Background: Institutional Dark Alpha ──────────────────────
            const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, '#000000');
            bgGradient.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);
 
            // ── Sub-Pixel Institutional Grid ───────────────────────────────
            ctx.strokeStyle = 'rgba(212, 255, 43, 0.05)'; // Aztek Chartreuse
            ctx.lineWidth = 0.5;
            for (let i = 0; i < width; i += 60) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
                ctx.stroke();
            }
            for (let i = 0; i < height; i += 60) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(width, i);
                ctx.stroke();
            }
 
            // ── Pulse Gradient Accent ──────────────────────────────────────
            const pulseOpacity = (Math.sin(Date.now() / 2500) * 0.02) + 0.03;
            const glow = ctx.createRadialGradient(
                width / 2, height * 0.3, 0,
                width / 2, height * 0.3, width
            );
            glow.addColorStop(0, `rgba(255, 45, 244, ${pulseOpacity})`); // Aztek Orchid
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
 
            // ── Institutional Connectivity Mesh ────────────────────────────
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;
 
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;
 
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 255, 43, 0.3)'; // Aztek Chartreuse
                ctx.fill();
 
                nodes.slice(i + 1).forEach(other => {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
 
                    if (dist < MAX_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(212, 255, 43, ${0.15 * (1 - dist / MAX_DIST)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const isMobile = typeof window !== 'undefined' ? (window.innerWidth < 768) : false;

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-[-2] outline-none border-none m-0 p-0 block will-change-transform"
            />
            {/* ── Institutional Watermark System (Phase 38) ────────────────── */}
            <div 
                className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.04] transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url(/official-whale-legendary.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: isMobile ? '50px' : '70px', // Responsive sizing
                    filter: 'grayscale(1) brightness(1.2)', // Legendary blending
                    transform: 'translate3d(0,0,0)', // GPU Force
                    backfaceVisibility: 'hidden',
                }}
            />
        </>
    );
}
