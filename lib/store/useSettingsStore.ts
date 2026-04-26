import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SovereignSettings {
    // 1-3. General / Aesthetic
    theme: 'light' | 'dark' | 'system';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
    language: 'es-ES' | 'en-US' | 'zh-CN';
    
    // 4. Density
    layoutDensity: 'relaxed' | 'compact' | 'dense';
    density?: string; // Legacy compat
    
    // 5-7. Network
    rpcNode: 'sovereign_local' | 'infura_premium' | 'alchemy_mainnet';
    testnetMode: boolean;
    websocketHealthPing: boolean;

    // 8-10. Sonar
    whaleThreshold: number;
    whaleAlertThreshold?: number; // Legacy compat
    audioAlerts: boolean;
    soundEffects?: boolean; // Legacy compat
    hapticFeedback: boolean;

    // 11-15. Privacy & Security
    stealthMode: boolean;
    showBalances: boolean;
    allowAnalytics: boolean;
    autoDisconnectTimer: '15m' | '1h' | '24h' | 'never';
    inactivityLockMinutes?: number; // Legacy compat
    biometricEnforcement: boolean;

    // 16-18. Execution
    mempoolSniffer: boolean;
    maxGasFee: number;
    maxSlippage?: number; // Legacy compat
    mevProtection: boolean;

    // 19-20. Visualization & Hardware
    portfolioGraphDefault: 'line' | 'candle';
    hardwareAcceleration: boolean;
}

export interface SettingsState extends SovereignSettings {
    settings: SovereignSettings | null; // Legacy compat
    isSettingsOpen: boolean;
    isLoading: boolean;
    isUpdating: boolean;
    
    // API Sync Methods
    fetchSettings: () => Promise<void>;
    updateSetting: <K extends keyof SovereignSettings>(key: K, value: SovereignSettings[K]) => Promise<void>;

    // Individual setters for backwards compatibility
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

const applyDOMClasses = (state: Partial<SovereignSettings>) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    // ── UI Density ──────────────────────────────────────────────────────────
    if (state.layoutDensity || state.density) {
        const d = state.layoutDensity || state.density;
        html.classList.remove('ui-relaxed', 'ui-compact', 'ui-dense');
        if (d === 'compact') html.classList.add('ui-compact');
        else if (d === 'dense') html.classList.add('ui-dense');
        else html.classList.add('ui-relaxed');
    }

    // ── Stealth Mode: blur all [data-balance] elements ──────────────────────
    if (state.stealthMode !== undefined) {
        if (state.stealthMode) html.classList.add('stealth-active');
        else html.classList.remove('stealth-active');
    }

    // ── Show Balances: hide-balances class when showBalances is false ────────
    if (state.showBalances !== undefined) {
        if (!state.showBalances) html.classList.add('hide-balances');
        else html.classList.remove('hide-balances');
    }

    // ── Hardware Acceleration: disable GPU compositing hints when off ────────
    if (state.hardwareAcceleration !== undefined) {
        if (!state.hardwareAcceleration) html.classList.add('no-hw-accel');
        else html.classList.remove('no-hw-accel');
    }
};


export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Default Values
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

            settings: null,
            isSettingsOpen: false,
            isLoading: false,
            isUpdating: false,

            fetchSettings: async () => {
                try {
                    set({ isLoading: true });
                    const res = await fetch('/api/user/settings');
                    if (res.ok) {
                        const data = await res.json();
                        set({ ...data, settings: data });
                        applyDOMClasses(data);
                    }
                } catch (e) {
                    console.error('Failed to fetch sovereign settings', e);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateSetting: async (key, value) => {
                // Optimistic Local Update
                set({ [key]: value, isUpdating: true } as any);
                applyDOMClasses({ [key]: value });

                try {
                    // Push to API
                    await fetch('/api/user/settings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [key]: value })
                    });
                } catch (e) {
                    console.error('Failed to sync setting to DB', e);
                } finally {
                    set({ isUpdating: false });
                }
            },

            setTheme: (val) => get().updateSetting('theme', val),
            setCurrency: (val) => get().updateSetting('currency', val),
            setLanguage: (val) => get().updateSetting('language', val),
            setLayoutDensity: (val) => get().updateSetting('layoutDensity', val),
            setRpcNode: (val) => get().updateSetting('rpcNode', val),
            setTestnetMode: (val) => get().updateSetting('testnetMode', val),
            setWebsocketHealthPing: (val) => get().updateSetting('websocketHealthPing', val),
            setWhaleThreshold: (val) => get().updateSetting('whaleThreshold', val),
            setAudioAlerts: (val) => get().updateSetting('audioAlerts', val),
            setHapticFeedback: (val) => get().updateSetting('hapticFeedback', val),
            setStealthMode: (val) => get().updateSetting('stealthMode', val),
            setShowBalances: (val) => get().updateSetting('showBalances', val),
            setAllowAnalytics: (val) => get().updateSetting('allowAnalytics', val),
            setAutoDisconnectTimer: (val) => get().updateSetting('autoDisconnectTimer', val),
            setBiometricEnforcement: (val) => get().updateSetting('biometricEnforcement', val),
            setMempoolSniffer: (val) => get().updateSetting('mempoolSniffer', val),
            setMaxGasFee: (val) => get().updateSetting('maxGasFee', val),
            setMevProtection: (val) => get().updateSetting('mevProtection', val),
            setPortfolioGraphDefault: (val) => get().updateSetting('portfolioGraphDefault', val),
            setHardwareAcceleration: (val) => get().updateSetting('hardwareAcceleration', val),

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
            name: 'sovereign-settings-store-v4',
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
            })
        }
    )
);
