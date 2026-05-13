'use client';

import { useEffect, useState } from 'react';
import { api } from '@/src/api/client';
import { useAppStore } from '@/src/stores/appStore';

const statusConfig: Record<string, { color: string; label: string }> = {
  ready: { color: 'bg-green-500', label: 'MiniMax Ready' },
  cli_missing: { color: 'bg-yellow-500', label: 'CLI 未检测到' },
  api_key_missing: { color: 'bg-red-500', label: 'API Key 缺失' },
  not_configured: { color: 'bg-gray-500', label: '未配置' },
  error: { color: 'bg-red-500', label: '连接错误' },
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

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-surface-light rounded-xl border border-surface-border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${loading ? 'animate-pulse-soft' : ''} ${cfg.color}`} />
        <span className="text-xs font-medium text-muted">{loading ? '检测中...' : cfg.label}</span>
      </div>
      <div className="flex-1" />
      <span className="text-xs text-muted-dim">
        网易云 <span className="text-accent-orange">未连接</span>
      </span>
    </div>
  );
}
