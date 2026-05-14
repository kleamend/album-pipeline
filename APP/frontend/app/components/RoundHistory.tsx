'use client';

interface RoundData {
  round: number;
  score: number | null;
  status: string;
}

interface Props {
  history: RoundData[];
}

export default function RoundHistory({ history }: Props) {
  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">分数演变</h3>
      <div className="flex items-end gap-4 h-32">
        {history.map((r) => {
          const h = r.score ? `${(r.score / 100) * 100}%` : '10%';
          return (
            <div key={r.round} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-white">{r.score ?? '—'}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-accent-orange/60 to-accent-pink/40 transition-all"
                style={{ height: h }}
              />
              <span className="text-[10px] text-muted-dim">R{r.round}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
