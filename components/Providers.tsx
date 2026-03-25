"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { State } from "wagmi";
import { SettingsProvider } from "@/src/context/SettingsContext";
import { AppProvider } from "@/components/AppContext";
import ClientWeb3Provider from '@/components/ClientWeb3Provider';
import { WorldProvider } from "@/src/context/WorldContext";

import { SessionProvider } from "next-auth/react";
import { ReactLenis } from 'lenis/react';
import { CWIProvider } from "@/lib/bsv/CWIContext";

export default function Providers({ children, initialState, cookies }: { children: React.ReactNode, initialState?: State, cookies?: string | null }) {
    return (
        <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AppProvider>
                <ClientWeb3Provider cookies={cookies || null}>
                    <SettingsProvider>
                        <LanguageProvider>
                            <WorldProvider>
                                <CWIProvider>
                                    {children}
                                </CWIProvider>
                            </WorldProvider>
                        </LanguageProvider>
                    </SettingsProvider>
                </ClientWeb3Provider>
            </AppProvider>
        </ThemeProvider>
        </SessionProvider>
        </ReactLenis>
    );
}

