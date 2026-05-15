'use client';

import { useState } from 'react';
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
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-dim">{tracks.length} 首</span>
      </div>
      <div className="flex flex-col">
        {tracks.length === 0 ? (
          <p className="text-xs text-muted-dim py-8 text-center">暂无曲目 — 等待概念阶段完成后自动生成</p>
        ) : (
          tracks.map((track) => (
            <Link
              key={track.id}
              href={`/albums/${albumId}/tracks/${track.id}`}
              onClick={() => setActiveTrack(track.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group relative ${
                activeTrack === track.id
                  ? 'bg-white/[0.05] border-l-2 border-accent-orange'
                  : 'border-l-2 border-transparent hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <span className="text-xs text-muted-dim w-5 tabular-nums flex-shrink-0">
                {String(track.index).padStart(2, '0')}
              </span>
              <span className={`text-sm font-medium flex-1 min-w-0 truncate transition-colors duration-300 ${
                activeTrack === track.id ? 'text-accent-orange' : 'text-primary group-hover:text-primary'
              }`}>
                {track.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                track.status === 'finalized'
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-muted-dim bg-white/[0.03] border border-white/[0.05]'
              }`}>
                {track.status === 'finalized' ? '✓' : track.status === 'running' ? '◎' : '○'}
              </span>
              {track.score != null && (
                <span className={`text-xs flex-shrink-0 w-10 text-right tabular-nums ${
                  (track.score ?? 0) >= 80 ? 'text-emerald-400' : (track.score ?? 0) >= 60 ? 'text-amber-400' : 'text-muted-dim'
                }`}>
                  {track.score}分
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
