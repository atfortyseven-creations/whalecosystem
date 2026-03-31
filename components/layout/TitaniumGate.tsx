'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SafeErrorBoundary } from '@/components/ui/SafeErrorBoundary';
import { WhaleAlertLoader } from '@/components/ui/WhaleAlertLoader';
import { createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

type GateState = 'INTRO' | 'AUTH' | 'APP';

interface GateContextType {
    state: GateState;
    hasPlayedIntro: boolean;
}

const GateStateContext = createContext<GateContextType>({ state: 'INTRO', hasPlayedIntro: false });
export const useGateState = () => useContext(GateStateContext);

interface TitaniumGateProps {
    children: React.ReactNode;
}

export function TitaniumGate({ children }: TitaniumGateProps) {
    const { isConnected } = useAccount();
    const [state, setState] = useState<GateState>('AUTH');
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    
    // Strict Whitelist: ONLY landing, docs, terms, privacy, and developers are visible to unauthenticated users.
    const isPublicPage = ['/', '/docs', '/terms', '/privacy', '/developers'].some(
        path => path === pathname || (path !== '/' && pathname?.startsWith(path))
    );

    useEffect(() => {
        setMounted(true);
        // Force the institutional loading screen to show for 2.2 seconds before finishing hydration
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        const checkAccess = () => {
            if (!mounted) return;

            // Priority 1: Wagmi is connected
            if (isConnected) {
                setState('APP');
                return;
            }

            // Priority 2: Public Page
            if (isPublicPage) {
                setState('APP');
                return;
            }

            // Priority 3: Sovereign Handshake (Cookie)
            const hasHandshake = typeof document !== 'undefined' && document.cookie.includes('sovereign_handshake=');
            if (hasHandshake) {
                setState('APP');
                return;
            }

            // Otherwise: Access Denied
            setState('AUTH');
            router.push('/');
        };

        checkAccess();
    }, [isConnected, isPublicPage, router, mounted]);

    // Loader — Show institutional loader during hydration and forced intro delay
    if (!mounted || showIntro) {
        return <WhaleAlertLoader bg="#FFFFFF" color="#000000" />;
    }

    return (
        <GateStateContext.Provider value={{ state, hasPlayedIntro: true }}>
            <AnimatePresence mode="wait">
                {/* THE APPLICATION */}
                {(state === 'APP') && (
                    <motion.div 
                        key="app-content"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <SafeErrorBoundary>
                            {children}
                        </SafeErrorBoundary>
                    </motion.div>
                )}
            </AnimatePresence>
        </GateStateContext.Provider>
    );
}

