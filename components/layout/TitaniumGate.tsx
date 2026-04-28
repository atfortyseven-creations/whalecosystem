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
    const { isConnected, isConnecting, isReconnecting } = useAccount();
    const pathname = usePathname();
    const router = useRouter();

    // Pre-compute isPublicPage synchronously so we can use it as the initial state.
    // This prevents the loader flash on /connect after disconnect.
    const initialIsPublicPage = ['/', '/connect', '/docs', '/terms', '/privacy', '/developers', '/forum'].some(
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
    const isPublicPage = ['/', '/connect', '/docs', '/terms', '/privacy', '/developers', '/forum'].some(
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
        // Increased debounce: 300ms was too short — on first mobile connection,
        // establishSession() writes the cookie AFTER wagmi reconnects (~200-400ms).
        // 1500ms gives wagmi + cookie-write time to complete before we gate.
        // With ssr:true + cookieStorage in appkit.tsx, reconnect is now synchronous
        // on return visits, so this guard only fires on the first-ever connect.
        const checkTimer = setTimeout(() => {
            if (!mounted) return;

            // Failsafe: if we are in the middle of connecting/reconnecting, WAIT.
            // This prevents aggressive redirects while the wallet modal is open.
            if (isConnecting || isReconnecting) return;

            // If mobile is in ultra recovery mode, WAIT for it to finish!
            // We MUST set state to APP so that MobileLanding mounts and runs its recovery loop!
            const isPendingWakeup = typeof localStorage !== 'undefined' && localStorage.getItem('sovereign_pending_wakeup') === '1';
            if (isPendingWakeup) {
                setState('APP');
                return;
            }

            // Priority 1: Wagmi is connected
            if (isConnected) {
                setState('APP');
                return;
            }

            // Priority 2: Public Page (/, /connect, /docs, etc.)
            if (isPublicPage) {
                setState('APP');
                return;
            }

            // Priority 3: Sovereign Handshake (Cookie — must have real 0x address)
            const hasHandshake = typeof document !== 'undefined'
                && document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'));
            if (hasHandshake) {
                setState('APP');
                return;
            }

            // Otherwise: Access Denied — redirect to connect
            setState('AUTH');
            if (pathname !== '/connect') router.push('/connect');
        }, 1500);

        return () => clearTimeout(checkTimer);
    }, [isConnected, isConnecting, isReconnecting, isPublicPage, router, mounted, pathname]);


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
                    null
                )}
            </AnimatePresence>
        </GateStateContext.Provider>
    );
}

