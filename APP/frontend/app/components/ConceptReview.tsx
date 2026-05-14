'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';

interface Props {
  albumId: string;
}

export default function ConceptReview({ albumId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startPhase(albumId, 'phase1');
      setStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.confirmConcept(albumId, true);
      router.push(`/albums/${albumId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await api.confirmConcept(albumId, false);
      setStarted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="font-display text-2xl font-bold text-white mb-2">Phase 1 · 专辑概念</h1>
      <p className="text-muted-dim text-sm mb-8">
        4 个专家将协作生成专辑概念：创意总监、市场专家、音乐总监 → 主评审评分。
      </p>

      {!started ? (
        <div className="card p-8 text-center">
          <p className="text-muted text-sm mb-6">准备就绪，点击下方按钮启动概念生成流水线</p>
          <button onClick={handleStart} disabled={loading} className="btn-primary">
            {loading ? '启动中...' : '开始概念生成'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-accent-orange rounded-full animate-pulse-soft" />
              <span className="text-sm font-medium text-white">概念生成中...</span>
            </div>
            <p className="text-sm text-muted-dim">
              3 个专家正在并行工作（创意总监 / 市场专家 / 音乐总监），随后主评审将进行评分。
            </p>
          </div>

          {/* Simulated results for demo */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold text-white mb-4">核心概念</h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-dim">专辑名称</span>
                <p className="text-white font-medium mt-1">《赝品候鸟》/ Counterfeit Migrants</p>
              </div>
              <div>
                <span className="text-xs text-muted-dim">核心概念</span>
                <p className="text-white mt-1">我们以为在迁徙，其实是在逃离。每只候鸟体内都藏着一个赝品的秘密。</p>
              </div>
              <div>
                <span className="text-xs text-muted-dim">核心悖论</span>
                <p className="text-white mt-1">飞得越远，离自己越近。</p>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg font-semibold text-white mb-4">评分总览</h2>
            <div className="space-y-3">
              {[
                ['概念原创性', 22],
                ['叙事连贯性', 24],
                ['市场潜力', 21],
                ['音乐一致性', 23],
              ].map(([dim, score]) => (
                <div key={dim} className="flex justify-between text-sm">
                  <span className="text-muted-dim">{dim}</span>
                  <span className="text-white font-medium">{score}/25</span>
                </div>
              ))}
              <div className="border-t border-surface-border pt-3 flex justify-between">
                <span className="text-white font-semibold">总分</span>
                <span className="text-xl font-bold text-accent-orange">90/100</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleApprove} disabled={loading} className="btn-primary flex-1">
              ✓ 确认概念，进入单曲创作
            </button>
            <button onClick={handleReject} disabled={loading} className="btn-secondary flex-1">
              ↻ 重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
