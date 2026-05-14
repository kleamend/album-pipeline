'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/src/api/client';
import { useAppStore } from '@/src/stores/appStore';

const statusLabels: Record<string, string> = {
  draft: '草稿',
  concept_running: '概念生成中',
  concept_review: '待确认概念',
  songwriting_running: '单曲创作中',
  lyrics_ready: '歌词已就绪',
  music_generating: '音乐生成中',
  listening_review: '听选中',
  transcoding: '转码中',
  packaging: '打包中',
  completed: '已完成',
};

const STATUS_ORDER = [
  'draft',
  'concept_running',
  'concept_review',
  'songwriting_running',
  'lyrics_ready',
  'music_generating',
  'listening_review',
  'transcoding',
  'packaging',
  'completed',
];

function getProgress(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx === -1) return 0;
  return Math.round((idx / (STATUS_ORDER.length - 1)) * 100);
}

export default function RecentProjects() {
  const recentAlbums = useAppStore((s) => s.recentAlbums);
  const setRecentAlbums = useAppStore((s) => s.setRecentAlbums);

  useEffect(() => {
    api.listAlbums().then(setRecentAlbums).catch(() => {});
  }, [setRecentAlbums]);

  const albums = useMemo(() => recentAlbums.slice(0, 6), [recentAlbums]);

  if (albums.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="section-header mb-5">
        <span>最近项目</span>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {albums.map((album, i) => {
          const progress = getProgress(album.status);
          return (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className={`card-glow group animate-fade-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Placeholder album art with vinyl groove pattern */}
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-accent-orange/[0.08] to-accent-pink/[0.04] mb-4 flex items-center justify-center relative overflow-hidden">
                {/* Vinyl groove rings — centered container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-square rounded-full border border-white/[0.07] opacity-25" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full border border-white/[0.06] opacity-25" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] aspect-square rounded-full border border-white/[0.05] opacity-25" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-full border border-white/[0.04] opacity-25" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square rounded-full bg-surface-darker border border-white/[0.05] opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full bg-accent-orange/30" />
                {/* Title overlay */}
                <span className="font-display text-xl font-bold text-accent-orange/25 relative z-10">
                  {album.title?.[0] || '?'}
                </span>
              </div>

              <div className="px-0.5">
                <h3 className="text-sm font-semibold text-white group-hover:text-accent-orange transition-colors duration-300 truncate">
                  {album.title || album.slug?.replace('album-', '')?.replace(/-/g, ' ') || '未命名专辑'}
                </h3>
                <p className="text-xs text-muted-dim mt-1.5">
                  {statusLabels[album.status] || album.status} · {album.trackCount ?? 0} 首
                </p>
              </div>

              {/* Progress bar */}
              <div className="progress-bar mt-3">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
