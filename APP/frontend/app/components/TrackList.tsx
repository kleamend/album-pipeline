'use client';

import Link from 'next/link';

interface TrackItem {
  id: string;
  index: number;
  title: string;
  score: number | null;
  status: string;
}

interface Props {
  tracks: TrackItem[];
  albumId: string;
}

export default function TrackList({ tracks, albumId }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest">曲目列表</h3>
        <span className="text-xs text-muted-dim">{tracks.length} 首</span>
      </div>
      <div className="flex flex-col gap-1">
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/albums/${albumId}/tracks/${track.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
          >
            <span className="text-xs text-muted-dim w-5">{String(track.index).padStart(2, '0')}</span>
            <span className="text-sm text-white font-medium flex-1 group-hover:text-accent-orange transition-colors">
              {track.title}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              track.status === 'finalized' ? 'text-green-400 bg-green-400/5' : 'text-muted-dim bg-surface-border/30'
            }`}>
              {track.status === 'finalized' ? '✓' : '○'}
            </span>
            {track.score && <span className="text-xs text-muted-dim w-10 text-right">{track.score}分</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
