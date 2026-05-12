"use client";

import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of Lottie to avoid SSR issues and optimize bundle size
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

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
    const lottieStyle = useMemo(() => ({
        width,
        height,
        ...style
    }), [width, height, style]);

    if (!animationData) return null;

    return (
        <div className={className} style={lottieStyle}>
            <Suspense fallback={<div className="w-full h-full bg-slate-50/5 animate-pulse rounded-2xl" />}>
                <Lottie
                    animationData={animationData}
                    loop={loop}
                    autoplay={autoplay}
                    style={{ width: '100%', height: '100%' }}
                    rendererSettings={{
                        preserveAspectRatio: 'xMidYMid slice',
                        progressiveLoad: true,
                        hideOnTransparent: true
                    }}
                />
            </Suspense>
        </div>
    );
};
