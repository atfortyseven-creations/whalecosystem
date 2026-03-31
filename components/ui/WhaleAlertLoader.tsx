"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface WhaleAlertLoaderProps {
  /** Permite sobreescribir el fondo. Por defecto hereda el background del componente padre. */
  bg?: string;
  /** Color del texto y del spinner. Por defecto negro. */
  color?: string;
}

export function WhaleAlertLoader({ bg = '#FFFFFF', color = '#000000' }: WhaleAlertLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: bg }}
    >
      {/* Logo / Texto */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8"
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="font-black text-4xl md:text-5xl uppercase tracking-tighter leading-none select-none"
            style={{ color }}
          >
            Whale Alert
          </h1>
          <h2
            className="font-black text-4xl md:text-5xl uppercase tracking-tighter leading-none select-none"
            style={{ color }}
          >
            Network
          </h2>
        </div>

        {/* Línea separadora animada */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-[2px] w-48 origin-left"
          style={{ background: color }}
        />

        {/* Spinner minimalista */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-6 h-6 border-2 border-t-transparent"
          style={{ borderColor: color, borderTopColor: 'transparent' }}
        />

        {/* Subtexto */}
        <p
          className="font-mono text-[9px] uppercase tracking-[0.4em]"
          style={{ color, opacity: 0.4 }}
        >
          Inicializando sistema soberano...
        </p>
      </motion.div>
    </div>
  );
}
