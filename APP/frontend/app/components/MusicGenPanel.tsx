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
    }).catch((e: any) => console.warn('Failed to load data:', e?.message || e));
  }, [albumId]);

  const handleStart = async () => {
    await api.startPhase(albumId, 'phase4');
    setPhaseStarted(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-muted-border bg-surface-light/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="badge-accent">Phase 4</span>
              <h1 className="section-header !text-xs !mb-0">音乐生成</h1>
            </div>
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
        <div className="border-r border-muted-border p-5 overflow-y-auto">
          <h3 className="section-header mb-4">曲目 · Prompt 状态</h3>
          {queue.map((t) => (
            <div key={t.track_id} className="card p-3 mb-2">
              <div className="text-xs text-primary font-medium">{String(t.index).padStart(2, '0')} · {t.title}</div>
              <div className="flex gap-1.5 mt-2">
                {t.prompts.map((p: any) => (
                  <span key={p.version} className={
                    p.status === 'done' ? 'badge-success text-[9px] px-2 py-0.5' :
                    p.status === 'running' ? 'badge-warning text-[9px] px-2 py-0.5' :
                    'badge text-[9px] px-2 py-0.5 bg-white/[0.03] border-muted-border text-muted-dim'
                  }>{p.version}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="vinyl-accent mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-orange/10 to-accent-pink/10 border-2 border-accent-orange/20 shadow-glow-md flex items-center justify-center mx-auto animate-float">
                <svg className="w-10 h-10 text-accent-orange/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v7" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-lg font-semibold text-primary mb-3">Prompt 生成工作区</h2>
            <p className="text-sm text-muted leading-relaxed">
              {phaseStarted
                ? '选择左侧曲目查看 3 种策略的 Prompt 并进行审查。审查通过后自动加入 MiniMax 生成队列。'
                : '点击上方按钮启动 Phase 4。系统将逐首生成 3 个策略版本的 Prompt 并自动审查。'}
            </p>
            {!phaseStarted && (
              <div className="mt-6 space-y-2 text-xs text-muted-dim">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-orange/40" />3 种策略版本并行生成</div>
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-pink/40" />AI 自动审查通过后加入队列</div>
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-rose/40" />MiniMax CLI 并行生成音乐</div>
              </div>
            )}
          </div>
        </div>

        <div className="border-l border-muted-border p-5 overflow-y-auto">
          <h3 className="section-header mb-4">生成队列</h3>

          {/* CLI status */}
          <div className="card p-4 mb-4 border-l-2 border-l-emerald-400/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft shadow-glow-sm" />
              <span className="text-xs text-emerald-400 font-medium">MiniMax CLI Ready</span>
            </div>
          </div>

          {/* Running items with shimmer */}
          <div className="space-y-2 mb-4">
            <div className="card p-3 border-l-2 border-l-amber-400/40 overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-primary font-medium">01 · 笼中鸟</span>
                <span className="badge-warning text-[9px] px-2 py-0.5">生成中</span>
              </div>
              <div className="progress-bar h-1.5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="progress-bar-fill" style={{ width: '65%' }} />
              </div>
              <div className="text-[10px] text-muted-dim mt-1 text-right">65%</div>
            </div>
            <div className="card p-3 border-l-2 border-l-amber-400/40 overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-primary font-medium">02 · 夜色</span>
                <span className="badge-warning text-[9px] px-2 py-0.5">生成中</span>
              </div>
              <div className="progress-bar h-1.5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="progress-bar-fill" style={{ width: '32%' }} />
              </div>
              <div className="text-[10px] text-muted-dim mt-1 text-right">32%</div>
            </div>
          </div>

          {/* Completed items */}
          <div className="space-y-2 mb-4">
            <div className="card p-3 border-l-2 border-l-emerald-400/40">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">03 · 自由说</span>
                <span className="badge-success text-[9px] px-2 py-0.5">完成</span>
              </div>
              <div className="text-[10px] text-muted-dim mt-1">2.3 MB · 3:42</div>
            </div>
          </div>

          {/* Concurrency controls */}
          <div className="card p-4">
            <div className="text-xs text-muted-dim mb-3">并发控制</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-muted-border text-muted hover:text-primary hover:border-white/[0.15] hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center text-sm font-medium active:scale-95">
                  −
                </button>
                <span className="text-primary font-semibold text-sm w-6 text-center">2</span>
                <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-muted-border text-muted hover:text-primary hover:border-white/[0.15] hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center text-sm font-medium active:scale-95">
                  +
                </button>
              </div>
              <div className="text-xs text-muted-dim">
                队列: <span className="text-primary font-medium">0</span> · 预计: <span className="text-primary font-medium">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
