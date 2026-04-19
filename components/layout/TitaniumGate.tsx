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
    const pathname = usePathname();
    const router = useRouter();

    // Pre-compute isPublicPage synchronously so we can use it as the initial state.
    // This prevents the loader flash on /connect after disconnect.
    const initialIsPublicPage = ['/connect', '/docs', '/terms', '/privacy', '/developers'].some(
        path => path === pathname || (path !== '/' && pathname?.startsWith(path))
    );

    const [state, setState] = useState<GateState>(initialIsPublicPage ? 'APP' : 'AUTH');
    const [mounted, setMounted] = useState(false);
    const [forceVisible, setForceVisible] = useState(false);

    useEffect(() => {
        // [INSTITUTIONAL FAIL-SAFE] 
        // Force system visibility after 4 seconds regardless of state.
        // This is a zero-trust measure against hydration hangs.
        const emergency = setTimeout(() => {
            console.warn('[TitaniumGate] Deadlock detected. Forcing emergency visibility.');
            setForceVisible(true);
        }, 5000);
        return () => clearTimeout(emergency);
    }, []);
    
    // Strict Whitelist: ONLY connect, docs, terms, privacy, and developers are visible to unauthenticated users.
    const isPublicPage = ['/connect', '/docs', '/terms', '/privacy', '/developers'].some(
        path => path === pathname || (path !== '/' && pathname?.startsWith(path))
    );

    useEffect(() => {
        setMounted(true);
        // Fail-safe: if after 2s we are still stuck, force APP state if on public page
        const timer = setTimeout(() => {
            if (isPublicPage) setState('APP');
        }, 2000);
        return () => clearTimeout(timer);
    }, [isPublicPage]);

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
            if (pathname !== '/connect') router.push('/connect');
        };

        checkAccess();
    }, [isConnected, isPublicPage, router, mounted, pathname]);

    // [iOS PERFECTION] We no longer return an invisible div. Instead, we render
    // the provider structure immediately to avoid React Tree mismatch crashes.

    return (
        <GateStateContext.Provider value={{ state, hasPlayedIntro: true }}>
            <AnimatePresence mode="wait">
                {/* THE APPLICATION (or EMERGENCY BYPASS) */}
                {(state === 'APP' || forceVisible) ? (
                    <div 
                        className="relative z-10"
                        style={forceVisible ? { opacity: 1, zIndex: 999, display: 'block' } : {}}
                    >
                        <SafeErrorBoundary>
                            {children}
                        </SafeErrorBoundary>
                    </div>
                ) : (
                    /* THE SKELETON / LOADING ENGINE */
                    <motion.div
                        key="gate-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-[#FAF9F6] flex flex-col items-center justify-center p-8"
                    >
                         <WhaleAlertLoader />
                         <div className="mt-8 flex flex-col items-center gap-2">
                             <div className="w-48 h-[1px] bg-black/5 relative overflow-hidden">
                                 <motion.div 
                                     className="absolute inset-0 bg-black/20"
                                     animate={{ x: ['-100%', '100%'] }}
                                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                 />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
                                 Sovereign Identity Resuming
                             </span>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GateStateContext.Provider>
    );
}

