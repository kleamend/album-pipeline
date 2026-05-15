import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string; type: ToastType; message: string;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2, 7);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast() {
  return {
    success: (msg: string) => useToastStore.getState().addToast('success', msg),
    error: (msg: string) => useToastStore.getState().addToast('error', msg),
    warning: (msg: string) => useToastStore.getState().addToast('warning', msg),
    info: (msg: string) => useToastStore.getState().addToast('info', msg),
  };
}
