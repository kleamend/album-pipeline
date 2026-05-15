'use client';

interface ArtifactItem {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
  size?: number;
}

interface Props {
  artifacts: ArtifactItem[];
}

const kindStyles: Record<string, string> = {
  concept: 'border-sky-500/20 bg-sky-500/5 text-sky-400',
  lyrics: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
  audio: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  video: 'border-pink-500/20 bg-pink-500/5 text-pink-400',
  cover: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  copy: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
};

function formatSize(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function ArtifactPanel({ artifacts }: Props) {
  return (
    <div>
      {artifacts.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <span className="text-muted-dim text-lg">📦</span>
          </div>
          <p className="text-xs text-muted-dim">暂无产物</p>
          <p className="text-[10px] text-muted-dim mt-1">流水线运行后将在此出现</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {artifacts.slice(0, 6).map((a) => {
            const ks = kindStyles[a.kind] || 'border-white/[0.05] bg-white/[0.02] text-muted-dim';
            return (
              <div key={a.id} className={`p-3 rounded-xl border transition-all duration-300 hover:translate-x-1 ${ks}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs text-primary font-medium leading-snug min-w-0">{a.title}</div>
                  {a.size != null && (
                    <span className="text-[10px] text-muted-dim flex-shrink-0 tabular-nums">{formatSize(a.size)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-dim">
                  <span className="badge bg-white/[0.04] border-white/[0.06] text-muted-dim px-2 py-0.5 text-[10px]">
                    {a.kind}
                  </span>
                  <span>{new Date(a.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
