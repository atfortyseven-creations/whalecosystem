"use client";

import React, { useEffect, useRef, useMemo } from 'react';

interface LottiePlayerProps {
    animationData: any;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    style?: React.CSSProperties;
    width?: string | number;
    height?: string | number;
}

export const LottiePlayer = ({
    animationData,
    className,
    loop = true,
    autoplay = true,
    style,
    width = '100%',
    height = '100%'
}: LottiePlayerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<any>(null);

    const lottieStyle = useMemo(() => ({
        width,
        height,
        ...style
    }), [width, height, style]);

    useEffect(() => {
        if (!containerRef.current || !animationData) return;

        let isMounted = true;
        let localInstance: any = null;

        import('lottie-web').then((lottieModule) => {
            if (!isMounted) return;
            const lottie = lottieModule.default || lottieModule;
            
            try {
                localInstance = lottie.loadAnimation({
                    container: containerRef.current!,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    animationData,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice',
                        progressiveLoad: true,
                        hideOnTransparent: true
                    }
                });
                instanceRef.current = localInstance;
            } catch (err) {
                console.error('Lottie init error:', err);
            }
        });

        return () => {
            isMounted = false;
            try {
                if (instanceRef.current) {
                    instanceRef.current.destroy();
                } else if (localInstance) {
                    localInstance.destroy();
                }
            } catch (e) {
                // ABYSMALLY PERFECT CATCH: completely suppresses the React 18 strict mode crash 
                // "this.elements[t].destroy is not a function" by isolating it within our own try/catch.
            } finally {
                instanceRef.current = null;
            }
        };
    }, [animationData, loop, autoplay]);

    if (!animationData) return null;

    return <div ref={containerRef} className={className} style={lottieStyle} />;
};
