'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { api } from '@/src/api/client';
import type { AlbumProject } from '@/src/types';

const filters = ['全部', '制作中', '等待确认', '已完成', '失败'];

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumProject[]>([]);
  const [filter, setFilter] = useState('全部');

  useEffect(() => {
    api.listAlbums().then(setAlbums).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">过往专辑</h1>
        <p className="text-muted-dim text-sm mb-8">管理你的所有 AI 专辑项目</p>

        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-accent-orange/10 border border-accent-orange/20 text-accent-orange'
                  : 'bg-surface-light border border-surface-border text-muted-dim hover:text-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {albums.map((album) => (
            <Link key={album.id} href={`/albums/${album.id}`} className="card group">
              <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-accent-orange/10 to-accent-pink/5 mb-3 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-accent-orange/20">
                  {album.title || '?'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{album.title || '未命名'}</h3>
              <p className="text-xs text-muted-dim mt-1">{album.trackCount} 首 · {album.languageMode}</p>
              <p className="text-xs text-muted-dim mt-0.5">{new Date(album.updatedAt).toLocaleDateString('zh-CN')}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
