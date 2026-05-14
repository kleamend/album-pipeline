'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhaseTimeline from './PhaseTimeline';
import TrackList from './TrackList';
import ArtifactPanel from './ArtifactPanel';
import { api } from '@/src/api/client';
import type { AlbumProject, PhaseRun } from '@/src/types';

interface Props {
  albumId: string;
}

export default function AlbumDashboard({ albumId }: Props) {
  const router = useRouter();
  const [album, setAlbum] = useState<AlbumProject | null>(null);
  const [phases, setPhases] = useState<PhaseRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAlbum(albumId),
      api.getPhases(albumId),
    ])
      .then(([a, p]) => { setAlbum(a); setPhases(p); })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [albumId, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse-soft text-muted-dim">加载中...</div>
    </div>
  );
  if (!album) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-surface-border bg-surface-light/50">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            《{album.title || '未命名专辑'}》
            {album.titleEn && <span className="text-muted-dim font-sans text-sm font-normal ml-2">/ {album.titleEn}</span>}
          </h1>
          <p className="text-xs text-muted-dim mt-1">
            创建于 {new Date(album.createdAt).toLocaleDateString('zh-CN')} · {album.languageMode} · {album.trackCount} 首
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            album.status === 'concept_running' ? 'bg-accent-orange/10 text-accent-orange' :
            album.status === 'completed' ? 'bg-green-400/10 text-green-400' :
            'bg-surface-border/30 text-muted-dim'
          }`}>
            {album.currentPhase || album.status}
          </span>
          {album.status === 'draft' && (
            <button onClick={() => router.push(`/albums/${albumId}/concept`)} className="btn-primary text-xs px-4 py-2">
              开始概念设计
            </button>
          )}
        </div>
      </div>

      {/* 3-column body */}
      <div className="flex-1 grid grid-cols-[240px_1fr_240px] overflow-hidden">
        <div className="border-r border-surface-border p-6 overflow-y-auto">
          <PhaseTimeline phaseRuns={phases} currentPhase={album.currentPhase} />
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-3">操作</h3>
            <div className="flex flex-col gap-2">
              <button className="text-xs text-muted-dim hover:text-white transition-colors text-left px-3 py-2 rounded-lg hover:bg-white/[0.03]">
                📋 查看日志
              </button>
              <button className="text-xs text-muted-dim hover:text-white transition-colors text-left px-3 py-2 rounded-lg hover:bg-white/[0.03]">
                📂 打开文件夹
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto border-r border-surface-border">
          <TrackList tracks={[]} albumId={albumId} />
        </div>

        <div className="p-6 overflow-y-auto">
          <ArtifactPanel artifacts={[]} />
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-dim uppercase tracking-widest mb-3">系统状态</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-muted">MiniMax CLI</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                <span className="text-muted">网易云音乐</span>
                <span className="text-muted-dim ml-auto">未连接</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
