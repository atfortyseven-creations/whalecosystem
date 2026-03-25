'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SafeErrorBoundary } from '@/components/ui/SafeErrorBoundary';
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
        if (!mounted) return;

        if (isConnected || isPublicPage) {
            setState('APP');
        } else {
            setState('AUTH'); // Instantly unmount private content
            // REDIRECT TO LANDING PAGE instantly if wallet is disconnected and trying to access private content
            router.push('/');
        }
    }, [isConnected, isPublicPage, router, mounted]);

    // Loader - Wait for client hydration to avoid wallet flicker
    if (!mounted) {
        return (
            <div className="fixed inset-0 bg-[var(--aztec-parchment)] flex items-center justify-center z-[9999]">
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: [0, 1, 0.5, 1],
                        scale: [0.8, 1, 0.98, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24"
                 >
                    <img 
                        src="/official-whale-legendary.png" 
                        alt="Loading" 
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                 </motion.div>
            </div>
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

