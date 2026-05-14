'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/src/api/client';
import { useAppStore } from '@/src/stores/appStore';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const DOT_BG: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-sky-400',
};

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  ready: { variant: 'success', label: 'MiniMax Ready' },
  cli_missing: { variant: 'info', label: 'MiniMax CLI 未安装' },
  cli_not_authenticated: { variant: 'warning', label: 'CLI 未登录' },
  cli_version_unknown: { variant: 'warning', label: 'CLI 可能不是 MiniMax' },
  api_key_missing: { variant: 'error', label: 'API Key 缺失' },
  not_configured: { variant: 'info', label: 'CLI 未配置' },
  error: { variant: 'error', label: '检测失败' },
};

export default function ProviderStatus() {
  const minimaxStatus = useAppStore((s) => s.minimaxStatus);
  const setMinimaxStatus = useAppStore((s) => s.setMinimaxStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProviderStatus()
      .then((data) => setMinimaxStatus(data.minimax))
      .catch(() => setMinimaxStatus('error'))
      .finally(() => setLoading(false));
  }, [setMinimaxStatus]);

  const cfg = statusConfig[minimaxStatus] || statusConfig.not_configured;
  const badgeClass = BADGE_CLASSES[cfg.variant];
  const dotBg = DOT_BG[cfg.variant];

  const glowColor = useMemo(() => {
    switch (cfg.variant) {
      case 'success': return 'rgba(16,185,129,0.5)';
      case 'warning': return 'rgba(245,158,11,0.5)';
      case 'error': return 'rgba(239,68,68,0.5)';
      default: return 'rgba(148,163,184,0.4)';
    }
  }, [cfg.variant]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-light rounded-xl border border-white/[0.05] mb-8">
        <span className={`w-1.5 h-1.5 rounded-full ${dotBg} animate-pulse-soft`} style={{ boxShadow: `0 0 6px ${glowColor}` }} />
        <span className="text-xs text-muted-dim animate-pulse-soft">检测中...</span>
        <div className="flex-1" />
        <span className="badge-info text-[10px]">未连接</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-light rounded-xl border border-white/[0.05] mb-8">
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotBg}`}
        style={{ boxShadow: `0 0 6px ${glowColor}` }}
      />
      <span className={`text-xs font-medium ${badgeClass}`}>
        {cfg.label}
      </span>
      <div className="flex-1" />
      <span className="badge-info text-[10px]">未连接</span>
    </div>
  );
}
