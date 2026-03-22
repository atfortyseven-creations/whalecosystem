"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { ShieldAlert, Zap } from 'lucide-react';

export type Toast = {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'alert' | 'error';
};

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function PremiumToasts() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              toast.type === 'alert'
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
                : 'bg-black/80 border-[#e0ff00]/30 text-[#e0ff00]'
            }`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'alert' ? <ShieldAlert size={20} /> : <Zap size={20} />}
            <div className="flex flex-col">
                <span className="text-xs font-black tracking-widest uppercase">{toast.title}</span>
                <span className="text-sm font-medium text-white/80">{toast.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
