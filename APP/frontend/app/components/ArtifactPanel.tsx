'use client';

interface ArtifactItem {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
}

interface Props {
  artifacts: ArtifactItem[];
}

export default function ArtifactPanel({ artifacts }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">最近产物</h3>
      {artifacts.length === 0 ? (
        <p className="text-xs text-muted-dim">暂无产物</p>
      ) : (
        <div className="flex flex-col gap-2">
          {artifacts.slice(0, 6).map((a) => (
            <div key={a.id} className="p-3 bg-surface-light rounded-lg border border-surface-border">
              <div className="text-xs text-white">{a.title}</div>
              <div className="text-[10px] text-muted-dim mt-1">
                {a.kind} · {new Date(a.createdAt).toLocaleTimeString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
