import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// ─── Global LRU JSON Cache ────────────────────────────────────────────────────
const JSON_CACHE = new Map<string, any>();
const JSON_PENDING = new Map<string, Promise<any>>();

async function loadLottieJSON(filename: string): Promise<any | null> {
  if (JSON_CACHE.has(filename)) return JSON_CACHE.get(filename);
  if (JSON_PENDING.has(filename)) return JSON_PENDING.get(filename);

  const pending = (async () => {
    try {
      const res = await fetch(`/${encodeURIComponent(filename)}`, {
        cache: 'force-cache',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && ('v' in data || 'layers' in data)) {
          JSON_CACHE.set(filename, data);
          return data;
        }
      }
    } catch { /* fall through */ }

    try {
      const res = await fetch(`/api/lottie?file=${encodeURIComponent(filename)}`, {
        cache: 'force-cache',
      });
      if (res.ok) {
        const data = await res.json();
        if (!data?.error) {
          JSON_CACHE.set(filename, data);
          return data;
        }
      }
    } catch { /* fall through */ }

    console.warn(`[Lottie] Could not load: ${filename}`);
    return null;
  })();

  JSON_PENDING.set(filename, pending);
  try {
    await pending;
  } finally {
    JSON_PENDING.delete(filename);
  }
  return pending;
}

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface OptimizedLocalLottieProps {
  filename: string;
  className?: string;
  isActive?: boolean;
  loop?: boolean;
  speed?: number;
}

export function OptimizedLocalLottie({
  filename,
  className,
  isActive = true,
  loop = true,
  speed = 1,
}: OptimizedLocalLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // Lazy load using native IntersectionObserver
  useEffect(() => {
    if (!containerRef.current || status !== 'idle') return;
    
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatus('loading');
        loadLottieJSON(filename).then((json) => {
          if (json) {
            setData(json);
            setStatus('ready');
          } else {
            setStatus('error');
          }
        });
        obs.disconnect();
      }
    }, { rootMargin: '800px' });
    
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [filename, status]);

  // Viewport freezing
  useEffect(() => {
    if (!containerRef.current || status !== 'ready' || !isActive) return;
    
    const obs = new IntersectionObserver(([entry]) => {
      const instance = lottieRef.current;
      if (!instance) return;
      if (entry.isIntersecting) {
        instance.play();
      } else {
        instance.pause();
      }
    }, { threshold: 0, rootMargin: '100px' });
    
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [status, isActive]);

  useEffect(() => {
    if (lottieRef.current && status === 'ready') {
      lottieRef.current.setSpeed(speed);
      if (!isActive) lottieRef.current.pause();
    }
  }, [speed, isActive, status]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{
         // Hardware acceleration hint
         transform: 'translateZ(0)',
         willChange: 'transform',
      }}
    >
      {status === 'ready' && data && (
        <Lottie
          lottieRef={lottieRef}
          animationData={data}
          loop={loop}
          autoplay={isActive}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid meet'
          }}
        />
      )}

      {/* Loading shimmer */}
      {(status === 'idle' || status === 'loading') && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f4ef]/60 rounded">
          <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#ccc]">···</span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 rounded">
          <span className="text-[10px] text-[#999]">○</span>
        </div>
      )}
    </div>
  );
}
