import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SettingsState {
    // 1-3. General / Aesthetic
    theme: 'light' | 'dark' | 'system';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
    language: 'es-ES' | 'en-US' | 'zh-CN';
    
    // 4. Density
    layoutDensity: 'relaxed' | 'compact' | 'dense';
    
    // 5-7. Network
    rpcNode: 'sovereign_local' | 'infura_premium' | 'alchemy_mainnet';
    testnetMode: boolean;
    websocketHealthPing: boolean; // setting 7

    // 8-10. Sonar
    whaleThreshold: number; // 8
    audioAlerts: boolean; // 9
    hapticFeedback: boolean; // 10

    // 11-15. Privacy & Security
    stealthMode: boolean; // 11
    showBalances: boolean; // 12
    allowAnalytics: boolean; // 13
    autoDisconnectTimer: '15m' | '1h' | '24h' | 'never'; // 14
    biometricEnforcement: boolean; // 15

    // 16-18. Execution
    mempoolSniffer: boolean; // 16
    maxGasFee: number; // 17
    mevProtection: boolean; // 18

    // 19-20. Visualization & Hardware
    portfolioGraphDefault: 'line' | 'candle'; // 19
    hardwareAcceleration: boolean; // 20

    isSettingsOpen: boolean;
    
    setTheme: (theme: SettingsState['theme']) => void;
    setCurrency: (currency: SettingsState['currency']) => void;
    setLanguage: (language: SettingsState['language']) => void;
    setLayoutDensity: (density: SettingsState['layoutDensity']) => void;
    setRpcNode: (node: SettingsState['rpcNode']) => void;
    setTestnetMode: (mode: boolean) => void;
    setWebsocketHealthPing: (val: boolean) => void;

    setWhaleThreshold: (threshold: number) => void;
    setAudioAlerts: (audio: boolean) => void;
    setHapticFeedback: (val: boolean) => void;

    setStealthMode: (stealth: boolean) => void;
    setShowBalances: (show: boolean) => void;
    setAllowAnalytics: (allow: boolean) => void;
    setAutoDisconnectTimer: (timer: SettingsState['autoDisconnectTimer']) => void;
    setBiometricEnforcement: (val: boolean) => void;

    setMempoolSniffer: (val: boolean) => void;
    setMaxGasFee: (val: number) => void;
    setMevProtection: (val: boolean) => void;

    setPortfolioGraphDefault: (val: SettingsState['portfolioGraphDefault']) => void;
    setHardwareAcceleration: (val: boolean) => void;

    setSettingsOpen: (open: boolean) => void;
    clearAppData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            currency: 'USD',
            language: 'en-US',
            layoutDensity: 'compact',
            rpcNode: 'sovereign_local',
            testnetMode: false,
            websocketHealthPing: true,
            
            whaleThreshold: 1000000,
            audioAlerts: true,
            hapticFeedback: true,

            stealthMode: false,
            showBalances: true,
            allowAnalytics: false,
            autoDisconnectTimer: '1h',
            biometricEnforcement: false,

            mempoolSniffer: true,
            maxGasFee: 300,
            mevProtection: true,

            portfolioGraphDefault: 'candle',
            hardwareAcceleration: true,

            isSettingsOpen: false,

            setTheme: (theme) => set({ theme }),
            setCurrency: (currency) => set({ currency }),
            setLanguage: (language) => set({ language }),
            setLayoutDensity: (layoutDensity) => set({ layoutDensity }),
            setRpcNode: (rpcNode) => set({ rpcNode }),
            setTestnetMode: (testnetMode) => set({ testnetMode }),
            setWebsocketHealthPing: (websocketHealthPing) => set({ websocketHealthPing }),

            setWhaleThreshold: (whaleThreshold) => set({ whaleThreshold }),
            setAudioAlerts: (audioAlerts) => set({ audioAlerts }),
            setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),

            setStealthMode: (stealthMode) => set({ stealthMode }),
            setShowBalances: (showBalances) => set({ showBalances }),
            setAllowAnalytics: (allowAnalytics) => set({ allowAnalytics }),
            setAutoDisconnectTimer: (autoDisconnectTimer) => set({ autoDisconnectTimer }),
            setBiometricEnforcement: (biometricEnforcement) => set({ biometricEnforcement }),

            setMempoolSniffer: (mempoolSniffer) => set({ mempoolSniffer }),
            setMaxGasFee: (maxGasFee) => set({ maxGasFee }),
            setMevProtection: (mevProtection) => set({ mevProtection }),

            setPortfolioGraphDefault: (portfolioGraphDefault) => set({ portfolioGraphDefault }),
            setHardwareAcceleration: (hardwareAcceleration) => set({ hardwareAcceleration }),

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
            name: 'sovereign-settings-store-v3',
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({ 
                theme: state.theme,
                currency: state.currency,
                language: state.language,
                layoutDensity: state.layoutDensity,
                rpcNode: state.rpcNode,
                testnetMode: state.testnetMode,
                websocketHealthPing: state.websocketHealthPing,
                whaleThreshold: state.whaleThreshold,
                audioAlerts: state.audioAlerts,
                hapticFeedback: state.hapticFeedback,
                stealthMode: state.stealthMode,
                showBalances: state.showBalances,
                allowAnalytics: state.allowAnalytics,
                autoDisconnectTimer: state.autoDisconnectTimer,
                biometricEnforcement: state.biometricEnforcement,
                mempoolSniffer: state.mempoolSniffer,
                maxGasFee: state.maxGasFee,
                mevProtection: state.mevProtection,
                portfolioGraphDefault: state.portfolioGraphDefault,
                hardwareAcceleration: state.hardwareAcceleration
            }),
        }
    )
);
