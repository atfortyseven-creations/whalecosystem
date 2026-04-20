import { create } from 'zustand';

export interface SovereignSettings {
    // Aesthetics
    theme: string;
    currency: string;
    language: string;
    density: string;

    // Portfolio
    showBalances: boolean;
    hiddenAssets: string[];
    defaultTimeframe: string;
    displayUnit: string;

    // Execution
    gasPreset: string;
    customRpcUrl: string | null;
    mevProtection: boolean;
    maxSlippage: number;

    // Security
    inactivityLockMinutes: number;
    stealthMode: boolean;
    requireSignForExports: boolean;
    allowAnalytics: boolean;

    // Alerts & Ecosystem
    emailAlerts: boolean;
    telegramAlerts: boolean;
    whaleAlertThreshold: number;
    soundEffects: boolean;
    
    // Core
    testnetMode: boolean;
}

interface SettingsState {
    settings: SovereignSettings | null;
    isLoading: boolean;
    isUpdating: boolean;
    fetchSettings: () => Promise<void>;
    updateSetting: <K extends keyof SovereignSettings>(key: K, value: SovereignSettings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    isLoading: true,
    isUpdating: false,

    fetchSettings: async () => {
        try {
            set({ isLoading: true });
            const res = await fetch('/api/user/settings');
            if (res.ok) {
                const data = await res.json();
                set({ settings: data });
                
                // Pure UI side-effects application (density scaling, stealth scrambler toggles globally via classes)
                if (typeof document !== 'undefined') {
                    const html = document.documentElement;
                    if (data.density === 'compact') {
                        html.classList.add('ui-compact');
                        html.classList.remove('ui-dense');
                    } else if (data.density === 'dense') {
                        html.classList.add('ui-dense');
                        html.classList.remove('ui-compact');
                    } else {
                        html.classList.remove('ui-compact', 'ui-dense');
                    }

                    if (data.stealthMode) {
                        html.classList.add('stealth-active');
                    } else {
                        html.classList.remove('stealth-active');
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch sovereign settings', e);
        } finally {
            set({ isLoading: false });
        }
    },

    updateSetting: async (key, value) => {
        const currentSettings = get().settings;
        if (!currentSettings) return;

        // Optimistic UI Update
        const optimisticSettings = { ...currentSettings, [key]: value };
        set({ settings: optimisticSettings, isUpdating: true });

        // Real-time CSS adjustments on the fly
        if (typeof document !== 'undefined') {
            const html = document.documentElement;
            if (key === 'density') {
                html.classList.remove('ui-compact', 'ui-dense');
                if (value === 'compact') html.classList.add('ui-compact');
                if (value === 'dense') html.classList.add('ui-dense');
            }
            if (key === 'stealthMode') {
                if (value) html.classList.add('stealth-active');
                else html.classList.remove('stealth-active');
            }
        }

        try {
            // Push mutation to Prisma DB via API
            const res = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            });

            if (!res.ok) {
                // Revert if API fails
                set({ settings: currentSettings });
            }
        } catch (e) {
            console.error('Failed to update setting in DB', e);
            set({ settings: currentSettings }); // Revert 
        } finally {
            set({ isUpdating: false });
        }
    }
}));
