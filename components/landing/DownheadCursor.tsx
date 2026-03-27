"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const DownheadCursor = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, mouseX, mouseY]);

  if (!isHovered) return null;

  return (
    <motion.div
      className="pointer-events-none absolute z-50 mix-blend-difference"
      style={{
        left: springX,
        top: springY,
        x: "-50%",
        y: "-50%",
      }}
    >
      {/* Intelligent Spotlight Effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="w-24 h-24 bg-white rounded-full blur-2xl opacity-40"
      />
      
      {/* Moving Particles/Trail */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-1 h-20 bg-gradient-to-t from-transparent via-white/50 to-transparent rotate-45" />
        <div className="w-1 h-20 bg-gradient-to-t from-transparent via-white/50 to-transparent -rotate-45" />
      </motion.div>
      
      {/* Central Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
      </div>
    </motion.div>
  );
};
