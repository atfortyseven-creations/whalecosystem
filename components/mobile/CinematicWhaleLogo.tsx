"use client";

import React from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { SplashContainer } from '@/components/shared/SplashContainer';

const whaleVariants: Variants = {
    loop: {
        x: [-10, 10, -8, 8, -10], 
        y: [-15, 12, -10, 8, -15],
        rotateZ: [-1.5, 2.5, -2, 1.5, -1.5],
        scale: [1, 1.03, 0.99, 1.02, 1],
        filter: [
            'drop-shadow(0px 0px 15px rgba(6, 182, 212, 0.3))', 
            'drop-shadow(0px 0px 40px rgba(6, 182, 212, 0.7))', 
            'drop-shadow(0px 0px 20px rgba(6, 182, 212, 0.4))',
            'drop-shadow(0px 0px 45px rgba(6, 182, 212, 0.8))',
            'drop-shadow(0px 0px 15px rgba(6, 182, 212, 0.3))'
        ],
        transition: { 
            duration: 14, 
            repeat: Infinity, 
            ease: [0.25, 0.1, 0.25, 1] // Custom organic cubic bezier
        }
    }
};

const auraVariants: Variants = {
    loop: {
        scale: [1, 1.2, 0.95, 1.15, 1],
        opacity: [0.1, 0.3, 0.1, 0.35, 0.1],
        boxShadow: [
            '0px 0px 20px 10px rgba(6, 182, 212, 0)',
            '0px 0px 60px 20px rgba(6, 182, 212, 0.3)',
            '0px 0px 30px 15px rgba(6, 182, 212, 0.1)',
            '0px 0px 70px 25px rgba(6, 182, 212, 0.4)',
            '0px 0px 20px 10px rgba(6, 182, 212, 0)'
        ],
        transition: { 
            duration: 14, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }
    }
};

export function CinematicWhaleLogo({ src = "/official-whale-monochrome.png", className = "" }: { src?: string, className?: string }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            
            {!prefersReducedMotion && (
                <>
                    {/* Ambient Glow Aura */}
                    <motion.div 
                        className="absolute inset-x-8 inset-y-8 rounded-[100%] bg-cyan-400/5 blur-[20px] z-0 pointer-events-none"
                        style={{ willChange: "transform, opacity, box-shadow" }}
                        variants={auraVariants}
                        animate="loop"
                    />

                    {/* Ocean Waves Parallax (Drift) */}
                    <motion.div 
                        className="absolute bottom-4 left-0 w-[200%] h-[1px] bg-cyan-500/10 z-0 pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                        animate={{ x: [0, -100], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                        className="absolute bottom-2 left-0 w-[200%] h-[1px] bg-cyan-400/5 z-0 pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                        animate={{ x: [0, -120], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Simulated Ambient Deep Sea Bubbles */}
                    <motion.div 
                        className="absolute bottom-4 right-8 w-2 h-2 bg-cyan-400/20 rounded-full blur-[1px] z-10 pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                            y: [0, -40],
                            x: [0, 20],
                            opacity: [0, 1, 0],
                            scale: [0, 2, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />
                    <motion.div 
                        className="absolute bottom-6 left-10 w-1.5 h-1.5 bg-cyan-500/30 rounded-full blur-[1px] z-10 pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                            y: [0, -50],
                            x: [0, -15],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeOut", delay: 3 }}
                    />
                </>
            )}

            {/* The single persistent Whale Image */}
            <SplashContainer className="w-full h-full absolute inset-0 z-20 pointer-events-auto shadow-none bg-transparent before:hidden after:hidden">
                {prefersReducedMotion ? (
                    <img 
                        src={src} 
                        alt="Whale"
                        className="w-full h-full object-contain mix-blend-screen opacity-90"
                    />
                ) : (
                    <motion.img 
                        src={src} 
                        alt="Whale"
                        className="w-full h-full object-contain mix-blend-screen"
                        style={{ willChange: "transform, filter" }}
                        variants={whaleVariants}
                        animate="loop"
                    />
                )}
            </SplashContainer>

        </div>
    );
}
