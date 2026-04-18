"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'framer-motion';
// Dynamic import for Lottie
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface OptimizedLocalLottieProps {
  filename: string;
  className?: string;
  isActive?: boolean;
}

export function OptimizedLocalLottie({ filename, className, isActive = true }: OptimizedLocalLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px 0px" });
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (isInView && !animationData) {
      fetch(`/api/lottie?file=${encodeURIComponent(filename)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setAnimationData(data);
          }
        })
        .catch(console.error);
    }
  }, [isInView, filename, animationData]);

  useEffect(() => {
    if (lottieRef.current) {
       if (isActive) lottieRef.current?.play?.();
       else lottieRef.current?.pause?.();
    }
  }, [isActive, animationData]);

  return (
    <div 
      ref={containerRef} 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ contentVisibility: 'auto', containIntrinsicSize: '200px', willChange: 'opacity, transform' }}
    >
      {!animationData && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Awaiting Geometry</span>
        </div>
      )}
      {animationData && (
        <Lottie 
          lottieRef={lottieRef}
          animationData={animationData} 
          loop={true}
          autoplay={isActive}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}
