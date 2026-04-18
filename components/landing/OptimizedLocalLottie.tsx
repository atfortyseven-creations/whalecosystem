// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'framer-motion';

// Dynamic import — no SSR for lottie-react
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface OptimizedLocalLottieProps {
  filename: string;
  className?: string;
  isActive?: boolean;
}

/**
 * Loads a Lottie JSON animation.
 *
 * Resolution order (first success wins):
 *   1. Static file served from /public/{filename}  — zero API overhead
 *   2. API route /api/lottie?file={filename}        — fallback, reads from disk
 *
 * Files placed directly inside /public/ are served by Next.js as static assets
 * and can be fetched via a root-relative URL: /{encodeURIComponent(filename)}
 */
async function loadLottieData(filename: string): Promise<any | null> {
  // Attempt 1: static public asset
  try {
    const staticUrl = `/${encodeURIComponent(filename)}`;
    const res = await fetch(staticUrl, { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      // Validate it's actually lottie data (has 'v' version field)
      if (data && typeof data === 'object' && ('v' in data || 'layers' in data || 'assets' in data)) {
        return data;
      }
    }
  } catch {
    // Static fetch failed — try API route
  }

  // Attempt 2: API route (reads from multiple filesystem paths)
  try {
    const apiUrl = `/api/lottie?file=${encodeURIComponent(filename)}`;
    const res = await fetch(apiUrl, { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      if (!data.error) return data;
    }
  } catch {
    // Both failed
  }

  console.warn(`[Lottie] Could not load: ${filename}`);
  return null;
}

export function OptimizedLocalLottie({
  filename,
  className,
  isActive = true,
}: OptimizedLocalLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const isInView = useInView(containerRef, { once: true, margin: '200px 0px' });
  const [animationData, setAnimationData] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isInView || animationData || failed) return;
    loadLottieData(filename).then((data) => {
      if (data) setAnimationData(data);
      else setFailed(true);
    });
  }, [isInView, filename, animationData, failed]);

  useEffect(() => {
    if (!lottieRef.current) return;
    if (isActive) lottieRef.current?.play?.();
    else lottieRef.current?.pause?.();
  }, [isActive, animationData]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '200px 200px',
      }}
    >
      {/* Loading placeholder — matches white editorial theme */}
      {!animationData && !failed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid #e8e5de',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f7f2',
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#ccc',
            }}
          >
            Loading…
          </span>
        </div>
      )}

      {/* Error state — minimal, editorial */}
      {failed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px dashed #e8e5de',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: '#ddd',
            }}
          >
            ○
          </span>
        </div>
      )}

      {/* Lottie animation */}
      {animationData && (
        // @ts-ignore
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          autoplay={isActive}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}
