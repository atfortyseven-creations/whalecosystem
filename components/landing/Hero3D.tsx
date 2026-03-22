"use client";

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm';
import { motion } from 'framer-motion';
import gsap from 'gsap';

// ── WebGL Neural Sphere Background ──────────────────────────
function WebGLParticleSphere(props: any) {
    const ref = useRef<any>();
    // High-density sphere for premium look
    const sphere = random.inSphere(new Float32Array(8000), { radius: 1.5 });

    useFrame((state, delta) => {
        if (!ref.current) return;
        // Subtle rotation unaffected by scroll
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;

        // Reactive mouse movement on the sphere (parallax)
        const targetX = (state.pointer.x * Math.PI) / 4;
        const targetY = (state.pointer.y * Math.PI) / 4;
        ref.current.rotation.y += 0.05 * (targetX - ref.current.rotation.y);
        ref.current.rotation.x += 0.05 * (targetY - ref.current.rotation.x);
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false} {...props}>
                <PointMaterial transparent color="#4F46E5" size={0.003} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

// ── Hero Section (Fase 1) ──────────────────────────────────
export function Hero3D() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // --- Custom Magnetic Cursor ---
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.8,
                    ease: "power3.out"
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- GSAP Blur-to-Focus Title Animation ---
        if (titleRef.current) {
            const chars = titleRef.current.innerText.split('');
            titleRef.current.innerText = '';
            
            chars.forEach((char) => {
                const span = document.createElement('span');
                span.innerText = char;
                span.style.opacity = '0';
                span.style.filter = 'blur(10px)';
                span.style.transform = 'translateY(20px)';
                span.style.display = 'inline-block';
                if(char === ' ') span.style.width = '2vw'; // preserve spaces
                titleRef.current?.appendChild(span);
            });

            gsap.to(titleRef.current.children, {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                duration: 1.2,
                stagger: 0.05,
                ease: 'power3.out',
                delay: 0.5
            });
        }

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- Magnetic CTA Interaction ---
    const handleMagneticHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = ctaRef.current;
        if (!btn) return;
        
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.4,
            y: y * 0.4,
            duration: 0.4,
            ease: "power3.out"
        });
    };

    const handleMagneticLeave = () => {
        if (ctaRef.current) {
            gsap.to(ctaRef.current, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
        }
    };

    return (
        <section className="relative w-full h-screen bg-[#030303] overflow-hidden cursor-none selection:bg-indigo-500/30">
            {/* Custom Follower Cursor */}
            <div 
                ref={cursorRef} 
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/20 pointer-events-none z-[100] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
            />

            {/* WebGL Canvas Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 3] }}>
                    <WebGLParticleSphere />
                </Canvas>
                {/* Radial gradient overlay to blend 3D canvas edge into HTML background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_80%)] pointer-events-none" />
            </div>

            {/* Hero Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                >
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/50">Next-Gen Blockchain Intelligence</span>
                </motion.div>

                <h1 
                    ref={titleRef}
                    className="text-[10vw] leading-[0.8] font-black uppercase text-white tracking-tighter mix-blend-difference"
                >
                    EL SISTEMA
                </h1>

                <div className="mt-8 md:mt-16 w-full max-w-xl mx-auto flex justify-center">
                    <button
                        ref={ctaRef}
                        onMouseMove={handleMagneticHover}
                        onMouseLeave={handleMagneticLeave}
                        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                        className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full overflow-hidden transition-colors hover:bg-transparent hover:text-white border border-transparent hover:border-white/30"
                    >
                        {/* Hover Fill Effect */}
                        <div className="absolute inset-0 w-full h-full bg-indigo-600 scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 -z-10" />
                        <span className="relative z-10">Iniciar Secuencia</span>
                    </button>
                </div>
            </div>

            {/* Scroll Indication */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
                <div className="text-[9px] uppercase font-bold tracking-widest">Descender</div>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-50" />
            </div>
        </section>
    );
}

