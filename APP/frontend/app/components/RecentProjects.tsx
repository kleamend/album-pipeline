'use client';

import { useEffect } from 'react';
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

export default function RecentProjects() {
  const { recentAlbums, setRecentAlbums } = useAppStore();

  useEffect(() => {
    api.listAlbums().then(setRecentAlbums).catch(() => {});
  }, [setRecentAlbums]);

  if (recentAlbums.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-4">最近项目</h2>
      <div className="grid grid-cols-3 gap-4">
        {recentAlbums.slice(0, 6).map((album) => (
          <Link key={album.id} href={`/albums/${album.id}`} className="card group">
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-accent-orange/10 to-accent-pink/5 mb-3 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-accent-orange/30">
                {album.title || '?'}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-accent-orange transition-colors">
              {album.title || '未命名专辑'}
            </h3>
            <p className="text-xs text-muted-dim mt-1">
              {statusLabels[album.status] || album.status} · {album.trackCount} 首
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
