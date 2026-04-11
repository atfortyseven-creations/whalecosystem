import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    language: 'es-ES' | 'en-US';
    showBalances: boolean;
    allowAnalytics: boolean;
    testnetMode: boolean;
    isSettingsOpen: boolean;
    
    setTheme: (theme: SettingsState['theme']) => void;
    setCurrency: (currency: SettingsState['currency']) => void;
    setLanguage: (language: SettingsState['language']) => void;
    setShowBalances: (show: boolean) => void;
    setAllowAnalytics: (allow: boolean) => void;
    setTestnetMode: (mode: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    clearAppData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light', // Initial professor emeritus aesthetic
            currency: 'USD',
            language: 'es-ES',
            showBalances: true,
            allowAnalytics: true,
            testnetMode: false,
            isSettingsOpen: false,

            setTheme: (theme) => set({ theme }),
            setCurrency: (currency) => set({ currency }),
            setLanguage: (language) => set({ language }),
            setShowBalances: (showBalances) => set({ showBalances }),
            setAllowAnalytics: (allowAnalytics) => set({ allowAnalytics }),
            setTestnetMode: (testnetMode) => set({ testnetMode }),
            setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
            clearAppData: () => {
                // Wipe local storage explicitly and completely reload
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                }
            }
        }),
        {
            name: 'sovereign-settings-store',
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({ 
                theme: state.theme,
                currency: state.currency,
                language: state.language,
                showBalances: state.showBalances,
                allowAnalytics: state.allowAnalytics,
                testnetMode: state.testnetMode
                // Exclude isSettingsOpen from persistence so it doesn't open on reload
            }),
        }
    )
);
