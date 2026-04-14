import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
    language: 'es-ES' | 'en-US' | 'zh-CN';
    
    // New Institutional Parameters
    layoutDensity: 'relaxed' | 'compact' | 'dense';
    rpcNode: 'sovereign_local' | 'infura_premium' | 'alchemy_mainnet';
    whaleThreshold: number;
    audioAlerts: boolean;
    stealthMode: boolean; // Institutional Privacy

    showBalances: boolean;
    allowAnalytics: boolean;
    testnetMode: boolean;
    isSettingsOpen: boolean;
    
    setTheme: (theme: SettingsState['theme']) => void;
    setCurrency: (currency: SettingsState['currency']) => void;
    setLanguage: (language: SettingsState['language']) => void;
    setLayoutDensity: (density: SettingsState['layoutDensity']) => void;
    setRpcNode: (node: SettingsState['rpcNode']) => void;
    setWhaleThreshold: (threshold: number) => void;
    setAudioAlerts: (audio: boolean) => void;
    setStealthMode: (stealth: boolean) => void;
    
    setShowBalances: (show: boolean) => void;
    setAllowAnalytics: (allow: boolean) => void;
    setTestnetMode: (mode: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    clearAppData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light', // Forced Ivory
            currency: 'USD',
            language: 'en-US',
            
            layoutDensity: 'compact',
            rpcNode: 'sovereign_local',
            whaleThreshold: 1000000, // $1M defaults
            audioAlerts: true,
            stealthMode: false,

            showBalances: true,
            allowAnalytics: false, // Strict privacy default
            testnetMode: false,
            isSettingsOpen: false,

            setTheme: (theme) => set({ theme }),
            setCurrency: (currency) => set({ currency }),
            setLanguage: (language) => set({ language }),
            setLayoutDensity: (layoutDensity) => set({ layoutDensity }),
            setRpcNode: (rpcNode) => set({ rpcNode }),
            setWhaleThreshold: (whaleThreshold) => set({ whaleThreshold }),
            setAudioAlerts: (audioAlerts) => set({ audioAlerts }),
            setStealthMode: (stealthMode) => set({ stealthMode }),

            setShowBalances: (showBalances) => set({ showBalances }),
            setAllowAnalytics: (allowAnalytics) => set({ allowAnalytics }),
            setTestnetMode: (testnetMode) => set({ testnetMode }),
            setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
            clearAppData: () => {
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                }
            }
        }),
        {
            name: 'sovereign-settings-store-v2',
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({ 
                theme: state.theme,
                currency: state.currency,
                language: state.language,
                layoutDensity: state.layoutDensity,
                rpcNode: state.rpcNode,
                whaleThreshold: state.whaleThreshold,
                audioAlerts: state.audioAlerts,
                stealthMode: state.stealthMode,
                showBalances: state.showBalances,
                allowAnalytics: state.allowAnalytics,
                testnetMode: state.testnetMode
            }),
        }
    )
);
