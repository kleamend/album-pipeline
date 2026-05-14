'use client';

const phases = [
  { key: 'phase1', label: 'Phase 1 · 专辑概念' },
  { key: 'phase2', label: 'Phase 2 · 单曲创作' },
  { key: 'phase3', label: 'Phase 3 · 歌词标准化' },
  { key: 'phase4', label: 'Phase 4 · 音乐生成' },
  { key: 'phase5', label: 'Phase 5 · 听选与转码' },
  { key: 'phase6', label: 'Phase 6 · 发布物料' },
];

interface Props {
  phaseRuns: { phase: string; status: string }[];
  currentPhase: string | null;
}

export default function PhaseTimeline({ phaseRuns, currentPhase }: Props) {
  const statusMap: Record<string, { icon: string; color: string }> = {
    completed: { icon: '✓', color: 'text-green-400 bg-green-400/10' },
    running: { icon: '◎', color: 'text-accent-orange bg-accent-orange/10 animate-pulse-soft' },
    waiting_user: { icon: '⏸', color: 'text-yellow-400 bg-yellow-400/10' },
    failed: { icon: '✗', color: 'text-red-400 bg-red-400/10' },
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">流水线进度</h3>
      <div className="flex flex-col gap-0">
        {phases.map((p, i) => {
          const run = phaseRuns.find((r) => r.phase === p.key);
          const status = run?.status || 'pending';
          const cfg = statusMap[status] || { icon: '', color: 'text-muted-dim border border-surface-border' };

          return (
            <div key={p.key}>
              <div className="flex items-center gap-3 py-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${cfg.color}`}>
                  {cfg.icon || ''}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${status === 'pending' ? 'text-muted-dim' : 'text-white'}`}>
                    {p.label}
                  </div>
                </div>
              </div>
              {i < phases.length - 1 && (
                <div className={`w-px h-4 ml-[13px] ${status === 'completed' ? 'bg-green-400/30' : 'bg-surface-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
