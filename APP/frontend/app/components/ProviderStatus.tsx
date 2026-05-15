'use client';
import { useEffect, useState } from 'react';
import { api } from '@/src/api/client';
import type { MinimaxStatus } from '@/src/types';

export default function ProviderStatus() {
  const [status, setStatus] = useState<MinimaxStatus | null>(null);
  const [llmKeyReady, setLlmKeyReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProviderStatus().then(data => {
      setStatus(data.minimax);
      setLlmKeyReady(data.llm_key_configured);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex gap-2 px-4 py-2"><span className="text-xs text-muted-dim animate-pulse-soft">检测中...</span></div>;

  const items = [
    { label: 'CLI', ok: status?.cli_installed, okText: '已安装', failText: '未安装' },
    { label: '认证', ok: status?.cli_authenticated, okText: '已登录', failText: '未登录' },
    { label: 'API', ok: status?.api_connected, okText: '已连通', failText: '未验证' },
    { label: 'LLM', ok: llmKeyReady, okText: 'Key 已配置', failText: 'Key 未配置' },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-light rounded-xl border border-white/[0.05] mb-8">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`text-[10px] font-medium ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
            {item.label}: {item.ok ? item.okText : item.failText}
          </span>
        </div>
      ))}
      <div className="flex-1" />
      <span className="text-[10px] text-muted-dim">网易云 未连接</span>
    </div>
  );
}
