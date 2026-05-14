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
  const statusMap: Record<string, { icon: string; dotClass: string }> = {
    completed: { icon: '✓', dotClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
    running: { icon: '◎', dotClass: 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30 shadow-glow-sm animate-pulse-soft' },
    waiting_user: { icon: '⏸', dotClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    failed: { icon: '✗', dotClass: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  };

  const getLineClass = (i: number) => {
    const currentRun = phaseRuns.find((r) => r.phase === phases[i].key);
    const currentStatus = currentRun?.status || 'pending';
    const nextRun = phaseRuns.find((r) => r.phase === phases[i + 1].key);
    const nextStatus = nextRun?.status || 'pending';

    if (currentStatus === 'completed' && nextStatus === 'completed') return 'bg-gradient-to-b from-emerald-500/30 to-emerald-500/20';
    if (currentStatus === 'completed' && nextStatus === 'running') return 'bg-gradient-to-b from-emerald-500/30 to-accent-orange/20';
    if (currentStatus === 'running') return 'bg-gradient-to-b from-accent-orange/20 to-surface-border';
    return 'bg-white/[0.06]';
  };

  return (
    <div>
      <div className="flex flex-col gap-0">
        {phases.map((p, i) => {
          const run = phaseRuns.find((r) => r.phase === p.key);
          const status = run?.status || 'pending';
          const cfg = statusMap[status] || { icon: '', dotClass: 'bg-white/[0.04] border border-white/[0.06] text-muted-dim' };

          return (
            <div key={p.key}>
              <div className="flex items-center gap-3 py-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-500 ${cfg.dotClass}`}>
                  {cfg.icon || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate transition-colors duration-300 ${
                    status === 'pending' ? 'text-muted-dim' :
                    status === 'running' ? 'text-gradient font-semibold' :
                    status === 'completed' ? 'text-white' :
                    'text-white'
                  }`}>
                    {p.label}
                  </div>
                </div>
              </div>
              {i < phases.length - 1 && (
                <div className={`w-px h-5 ml-[13px] transition-colors duration-500 ${getLineClass(i)}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
