import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isStealthMode: boolean;
  isConnectModalOpen: boolean;
  activePanel: 'history' | 'notifications' | 'settings' | 'privacy' | null;
  toggleStealthMode: () => void;
  setStealthMode: (value: boolean) => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  setActivePanel: (panel: 'history' | 'notifications' | 'settings' | 'privacy' | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isStealthMode: false,
      isConnectModalOpen: false,
      activePanel: null,
      toggleStealthMode: () => set((state) => ({ isStealthMode: !state.isStealthMode })),
      setStealthMode: (value) => set({ isStealthMode: value }),
      openConnectModal: () => set({ isConnectModalOpen: true }),
      closeConnectModal: () => set({ isConnectModalOpen: false }),
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: 'human-ui-storage',
    }
  )
)

