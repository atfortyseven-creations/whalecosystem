"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { SplashContainer } from '@/components/shared/SplashContainer';

const whaleVariants: Variants = {
    swim: {
        x: [-15, 15, -15], 
        y: [-5, 5, -5],
        rotateZ: [-2, 2, -2],
        scale: 1,
        filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    pulse: {
        x: 0, y: 0, rotateZ: 0,
        scale: [0.95, 1.05, 0.95],
        filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
        transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
    },
    breach: {
        x: 0,
        y: [0, -40, 0],
        rotateZ: [0, -15, 0],
        scale: 1,
        filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
        transition: { duration: 3, repeat: Infinity, ease: ["easeOut", "easeIn", "easeInOut"], times: [0, 0.4, 1] }
    },
    glow: {
        x: 0, y: 0, rotateZ: 0,
        scale: [0.98, 1.02, 0.98],
        filter: [
            'drop-shadow(0px 0px 0px rgba(0,0,0,0))', 
            'drop-shadow(0px 0px 15px rgba(0,0,0,0.3))', 
            'drop-shadow(0px 0px 0px rgba(0,0,0,0))'
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    drift: {
        x: [20, -20, 20],
        y: [-2, 2, -2],
        rotateZ: 0,
        scale: 1,
        filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    }
};

const animationKeys = ['swim', 'pulse', 'breach', 'glow', 'drift'] as const;

export function CinematicWhaleLogo({ src = "/official-whale-monochrome.png", className = "" }: { src?: string, className?: string }) {
    const [animationIndex, setAnimationIndex] = useState(0);

    // Cycle through the 5 requested cinematic animations every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationIndex(prev => (prev + 1) % 5);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const activeAnimation = animationKeys[animationIndex];

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            
            {/* Ocean Waves Parallax (Drift - Index 4) */}
            <motion.div 
                className="absolute bottom-4 left-0 w-[200%] h-[1px] bg-black/10 z-0 pointer-events-none"
                style={{ willChange: "transform, opacity" }}
                animate={animationIndex === 4 ? { x: [0, -100], opacity: 1 } : { x: 0, opacity: 0 }}
                transition={animationIndex === 4 ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
            />
            <motion.div 
                className="absolute bottom-2 left-0 w-[200%] h-[1px] bg-black/5 z-0 pointer-events-none"
                style={{ willChange: "transform, opacity" }}
                animate={animationIndex === 4 ? { x: [0, -120], opacity: 1 } : { x: 0, opacity: 0 }}
                transition={animationIndex === 4 ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
            />

            {/* Simulated Splash Particles via CSS box-shadow trails (Breach - Index 2) */}
            <motion.div 
                className="absolute bottom-4 right-8 w-2 h-2 bg-black/20 rounded-full blur-[1px] z-10 pointer-events-none"
                style={{ willChange: "transform, opacity" }}
                animate={animationIndex === 2 ? {
                    y: [0, -30, 10],
                    x: [0, 20, 30],
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0]
                } : { opacity: 0, y: 0, x: 0, scale: 0 }}
                transition={animationIndex === 2 ? { duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.1 } : { duration: 0.5 }}
            />
            <motion.div 
                className="absolute bottom-6 right-10 w-1.5 h-1.5 bg-black/10 rounded-full blur-[1px] z-10 pointer-events-none"
                style={{ willChange: "transform, opacity" }}
                animate={animationIndex === 2 ? {
                    y: [0, -20, 15],
                    x: [0, -10, -20],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                } : { opacity: 0, y: 0, x: 0, scale: 0 }}
                transition={animationIndex === 2 ? { duration: 3, repeat: Infinity, ease: "easeOut" } : { duration: 0.5 }}
            />

            {/* The single persistent Whale Image */}
            <SplashContainer className="w-full h-full absolute inset-0 z-20 pointer-events-auto">
                <motion.img 
                    src={src} 
                    alt="Whale"
                    className="w-full h-full object-contain drop-shadow-sm"
                    style={{ willChange: "transform, filter" }}
                    variants={whaleVariants}
                    animate={activeAnimation}
                />
            </SplashContainer>

            {/* Micro-indicator of which animation is currently active */}
            <div className="absolute -bottom-6 flex gap-1.5 z-30 pointer-events-none">
                {[0,1,2,3,4].map(idx => (
                    <div 
                        key={idx} 
                        className={`w-1 h-1 rounded-full transition-all duration-500 ease-out will-change-transform ${idx === animationIndex ? 'bg-[#050505]/40 scale-125' : 'bg-[#050505]/10 scale-100'}`} 
                    />
                ))}
            </div>
        </div>
    );
}
