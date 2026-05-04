import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SovereignSettings {
    // 1. General / Aesthetic
    theme: 'light' | 'dark' | 'system';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
    
    // 2. Density
    layoutDensity: 'relaxed' | 'compact' | 'dense';
    density?: string; // Legacy compat
    
    // 3. Network
    testnetMode: boolean;

    // 4. Sonar
    audioAlerts: boolean;
    soundEffects?: boolean; // Legacy compat

    // 5-8. Privacy & Security
    stealthMode: boolean;
    showBalances: boolean;
    allowAnalytics: boolean;
    autoDisconnectTimer: '15m' | '1h' | '24h' | 'never';
    inactivityLockMinutes?: number; // Legacy compat

    // 9. Visualization & Hardware
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
    setLayoutDensity: (density: SettingsState['layoutDensity']) => void;
    setTestnetMode: (mode: boolean) => void;
    setAudioAlerts: (audio: boolean) => void;
    setStealthMode: (stealth: boolean) => void;
    setShowBalances: (show: boolean) => void;
    setAllowAnalytics: (allow: boolean) => void;
    setAutoDisconnectTimer: (timer: SettingsState['autoDisconnectTimer']) => void;
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
            layoutDensity: 'compact',
            testnetMode: false,
            audioAlerts: true,
            stealthMode: false,
            showBalances: true,
            allowAnalytics: false,
            autoDisconnectTimer: '1h',
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
            setLayoutDensity: (val) => get().updateSetting('layoutDensity', val),
            setTestnetMode: (val) => get().updateSetting('testnetMode', val),
            setAudioAlerts: (val) => get().updateSetting('audioAlerts', val),
            setStealthMode: (val) => get().updateSetting('stealthMode', val),
            setShowBalances: (val) => get().updateSetting('showBalances', val),
            setAllowAnalytics: (val) => get().updateSetting('allowAnalytics', val),
            setAutoDisconnectTimer: (val) => get().updateSetting('autoDisconnectTimer', val),
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
                layoutDensity: state.layoutDensity,
                testnetMode: state.testnetMode,
                audioAlerts: state.audioAlerts,
                stealthMode: state.stealthMode,
                showBalances: state.showBalances,
                allowAnalytics: state.allowAnalytics,
                autoDisconnectTimer: state.autoDisconnectTimer,
                hardwareAcceleration: state.hardwareAcceleration
            })
        }
    )
);
