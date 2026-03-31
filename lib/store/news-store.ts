import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NewsState {
  isNewsSubscribed: boolean;
  setNewsSubscribed: (value: boolean) => void;
  lastBackupDate: string | null;
  setLastBackupDate: (date: string) => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set) => ({
      isNewsSubscribed: false,
      setNewsSubscribed: (value) => set({ isNewsSubscribed: value }),
      lastBackupDate: null,
      setLastBackupDate: (date) => set({ lastBackupDate: date }),
    }),
    {
      name: 'whale-news-storage', // Almacenado en localStorage/sessionStorage sin PII
      storage: createJSONStorage(() => sessionStorage), // Usamos sessionStorage para cumplir la caducidad y máxima sobriedad
    }
  )
);
