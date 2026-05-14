'use client';

import { useEffect, useState } from 'react';
import { api } from '@/src/api/client';

interface Props {
  albumId: string;
}

export default function MusicGenPanel({ albumId }: Props) {
  const [queue, setQueue] = useState<any[]>([]);
  const [phaseStarted, setPhaseStarted] = useState(false);

  useEffect(() => {
    api.getPhases(albumId).then((phases) => {
      const p4 = phases.find((p: any) => p.phase === 'phase4');
      if (p4 && p4.status === 'running') {
        setPhaseStarted(true);
        api.getGenerationQueue(albumId).then((data: any) => setQueue(data.tracks));
      }
    }).catch(() => {});
  }, [albumId]);

  const handleStart = async () => {
    await api.startPhase(albumId, 'phase4');
    setPhaseStarted(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-surface-border bg-surface-light/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white">Phase 4 · 音乐生成</h1>
            <p className="text-xs text-muted-dim mt-1">Prompt 生成 → 审查 → MiniMax CLI 并行调用</p>
          </div>
          {!phaseStarted && (
            <button onClick={handleStart} className="btn-primary text-sm px-6 py-2">
              开始 Prompt 生成
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[240px_1fr_280px] overflow-hidden">
        <div className="border-r border-surface-border p-5 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">曲目 · Prompt 状态</h3>
          {queue.map((t) => (
            <div key={t.track_id} className="p-3 rounded-lg border border-surface-border mb-2">
              <div className="text-xs text-white font-medium">{String(t.index).padStart(2, '0')} · {t.title}</div>
              <div className="flex gap-1 mt-2">
                {t.prompts.map((p: any) => (
                  <span key={p.version} className={`px-2 py-0.5 rounded text-[9px] ${
                    p.status === 'done' ? 'bg-green-400/10 text-green-400' :
                    p.status === 'running' ? 'bg-accent-orange/10 text-accent-orange' :
                    'bg-surface-border/30 text-muted-dim'
                  }`}>{p.version}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-orange/10 to-accent-pink/10 border border-surface-border flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🎵</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Prompt 生成工作区</h2>
            <p className="text-sm text-muted-dim max-w-md">
              {phaseStarted
                ? '选择左侧曲目查看 3 种策略的 Prompt 并进行审查。审查通过后自动加入 MiniMax 生成队列。'
                : '点击上方按钮启动 Phase 4。系统将逐首生成 3 个策略版本的 Prompt 并自动审查。'}
            </p>
          </div>
        </div>

        <div className="border-l border-surface-border p-5 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">生成队列</h3>
          <div className="p-4 bg-surface-light rounded-xl border border-surface-border mb-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
              <span className="text-xs text-muted">MiniMax CLI Ready</span>
            </div>
            <div className="text-xs text-muted-dim">并发: 2 · 队列: 0 · 预计: --</div>
          </div>
        </div>
      </div>
    </div>
  );
}
