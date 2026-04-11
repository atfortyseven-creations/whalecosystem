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
    const pathname = usePathname();
    const router = useRouter();
    
    // Strict Whitelist: ONLY landing, docs, terms, privacy, and developers are visible to unauthenticated users.
    const isPublicPage = ['/', '/docs', '/terms', '/privacy', '/developers'].some(
        path => path === pathname || (path !== '/' && pathname?.startsWith(path))
    );

    useEffect(() => {
        setMounted(true);
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

    if (!mounted) {
        // CRITICAL iOS FIX: Never return null from a Provider-tree component.
        // Returning null on first render breaks React hydration on iOS Safari —
        // it causes the entire Provider subtree to unmount and re-mount,
        // triggering a cascade of context errors and a blank screen.
        // An invisible skeleton div preserves the tree while mounting.
        return (
            <GateStateContext.Provider value={{ state: 'AUTH', hasPlayedIntro: false }}>
                <div
                    aria-hidden="true"
                    style={{ visibility: 'hidden', position: 'fixed', inset: 0, zIndex: -1 }}
                />
            </GateStateContext.Provider>
        );
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

