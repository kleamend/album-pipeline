'use client';

import { useToastStore } from '@/src/stores/toastStore';

const colors: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`px-4 py-3 rounded-xl border backdrop-blur-sm text-sm cursor-pointer animate-slide-in-right shadow-elevated ${colors[t.type] || colors.info}`}
        >
          {t.message}
          <div className="h-0.5 mt-2 rounded-full bg-current/20 overflow-hidden">
            <div className="h-full bg-current/40 rounded-full" style={{ animation: 'shrink 4s linear forwards' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
