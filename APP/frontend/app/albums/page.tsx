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

  const filteredAlbums = albums.filter(a => {
    if (filter === '全部') return true;
    if (filter === '制作中') return !['completed', 'failed', 'archived'].includes(a.status);
    if (filter === '等待确认') return a.status === 'concept_review';
    if (filter === '已完成') return a.status === 'completed';
    if (filter === '失败') return a.status === 'failed';
    return true;
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">过往专辑</h1>
        <p className="text-muted-dim text-sm mb-8">管理你的所有 AI 专辑项目</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                filter === f
                  ? 'badge-accent shadow-glow-sm'
                  : 'badge bg-white/[0.02] border border-white/[0.04] text-muted-dim hover:text-white hover:border-white/[0.10] hover:bg-white/[0.05] hover:-translate-y-0.5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
            <div className="relative mb-10">
              <div className="w-36 h-36 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-pink/10 border border-accent-orange/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-orange/40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                </div>
              </div>
              {/* Grooves */}
              <div className="absolute inset-1 rounded-full border border-white/[0.02]" />
              <div className="absolute inset-2 rounded-full border border-white/[0.02]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent-orange/[0.03] blur-3xl" />
            </div>
            <h2 className="text-xl font-display text-white mb-3">还没有专辑</h2>
            <p className="text-sm text-muted-dim mb-8 max-w-sm">创建你的第一张 AI 专辑，开始音乐之旅</p>
            <Link href="/" className="btn-primary">
              创建你的第一张专辑
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAlbums.map((album, idx) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="card-glow group animate-fade-in-up p-5"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'backwards' }}
              >
                {/* Vinyl-inspired cover placeholder */}
                <div className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center relative overflow-hidden bg-surface-dark">
                  {/* Outer groove */}
                  <div className="absolute inset-2 rounded-full border border-white/[0.03]" />
                  <div className="absolute inset-4 rounded-full border border-white/[0.02]" />
                  <div className="absolute inset-6 rounded-full border border-white/[0.02]" />
                  {/* Label */}
                  <div className="w-16 h-16 rounded-full bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-accent-orange/40" />
                  </div>
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/[0.03] to-accent-pink/[0.02]" />
                  {/* Reflection line */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent rounded-full" />
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-accent-orange transition-colors truncate">
                  {album.title || '未命名'}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-dim">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-muted-dim" />
                    {album.trackCount} 首
                  </span>
                  <span>{album.languageMode}</span>
                </div>
                <p className="text-xs text-muted-dim mt-1.5">
                  {new Date(album.updatedAt).toLocaleDateString('zh-CN')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
