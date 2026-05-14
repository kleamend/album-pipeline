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
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAlbum(albumId),
      api.getPhases(albumId),
    ])
      .then(([a, p]) => {
        setAlbum(a);
        setPhases(p);
        const mockTracks = Array.from({ length: a.trackCount }, (_, i) => ({
          id: `${albumId}-t${i + 1}`,
          index: i + 1,
          title: a.title ? `T${i + 1} · ${a.title}` : `T${i + 1}`,
          score: null as number | null,
          status: 'planned' as string,
        }));
        setTracks(mockTracks);
      })
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
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.05] bg-surface-dark/50 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              《{album.title || '未命名专辑'}》
              {album.titleEn && <span className="text-muted-dim font-sans text-base font-normal ml-2">/ {album.titleEn}</span>}
            </h1>
            <span className={`badge text-[11px] px-3 py-1 ${
              album.status === 'concept_running' ? 'badge-accent' :
              album.status === 'completed' ? 'badge-success' :
              album.status === 'failed' ? 'badge-error' :
              'badge-info'
            }`}>
              {album.currentPhase || album.status}
            </span>
          </div>
          <p className="text-xs text-muted-dim mt-2 flex items-center gap-1.5">
            <span>创建于 {new Date(album.createdAt).toLocaleDateString('zh-CN')}</span>
            <span className="text-white/[0.10]">·</span>
            <span>{album.languageMode}</span>
            <span className="text-white/[0.10]">·</span>
            <span>{album.trackCount} 首</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {album.status === 'draft' && (
            <button onClick={() => router.push(`/albums/${albumId}/concept`)} className="btn-primary">
              开始概念设计
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* 3-column body */}
      <div className="flex-1 grid grid-cols-[260px_1fr_260px] overflow-hidden">
        {/* Left sidebar */}
        <div className="border-r border-white/[0.05] p-6 overflow-y-auto">
          <div className="section-header mb-5">流水线</div>
          <PhaseTimeline phaseRuns={phases} currentPhase={album.currentPhase} />
          <div className="divider my-6" />
          <div className="section-header mb-4">操作</div>
          <div className="flex flex-col gap-1">
            <button className="text-xs text-muted-dim hover:text-white transition-all duration-200 text-left px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:translate-x-0.5">
              <span className="mr-2">📋</span>查看日志
            </button>
            <button className="text-xs text-muted-dim hover:text-white transition-all duration-200 text-left px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:translate-x-0.5">
              <span className="mr-2">📂</span>打开文件夹
            </button>
          </div>
        </div>

        {/* Center - Track list */}
        <div className="p-6 overflow-y-auto border-r border-white/[0.05]">
          <div className="section-header mb-5">曲目</div>
          <TrackList tracks={tracks} albumId={albumId} />
        </div>

        {/* Right sidebar */}
        <div className="p-6 overflow-y-auto">
          <div className="section-header mb-5">产物</div>
          <ArtifactPanel artifacts={[]} />
          <div className="divider my-6" />
          <div className="section-header mb-4">系统状态</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse-soft" />
              <span className="text-xs text-muted">MiniMax CLI</span>
              <span className="badge-success ml-auto text-[10px]">在线</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <span className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.3)]" />
              <span className="text-xs text-muted">网易云音乐</span>
              <span className="badge-warning ml-auto text-[10px]">未连接</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
