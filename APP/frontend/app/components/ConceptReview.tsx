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
        <div className="card-glow p-10 text-center animate-fade-in-up">
          <div className="vinyl-accent mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-pink/10 border border-accent-orange/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-orange/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
          </div>
          <p className="text-base text-white font-medium mb-2">准备开始了吗？</p>
          <p className="text-muted text-sm mb-8">点击下方按钮启动概念生成流水线，AI 专家团队将为你创作专辑概念</p>
          <button onClick={handleStart} disabled={loading} className="btn-primary">
            {loading ? '启动中...' : '开始概念生成'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card-glow p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 bg-accent-orange rounded-full animate-pulse-soft shadow-[0_0_10px_rgba(251,146,60,0.6)]" />
              <span className="text-sm font-medium text-white">概念生成中...</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-dim">
                3 个专家正在并行工作（创意总监 / 市场专家 / 音乐总监），随后主评审将进行评分。
              </p>
              <div className="flex gap-2 pt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full bg-accent-orange/30 animate-pulse-soft" style={{ animationDelay: `${i * 200}ms`, width: `${30 + Math.random() * 40}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated results for demo */}
          <div className="card-glow p-6 animate-fade-in-up animate-delay-200">
            <div className="section-header mb-5">核心概念</div>
            <div className="space-y-5">
              <div>
                <span className="text-xs text-muted-dim tracking-wide uppercase">专辑名称</span>
                <p className="text-white font-display text-xl font-semibold mt-2">《赝品候鸟》<span className="text-muted-dim font-sans text-sm font-normal">/ Counterfeit Migrants</span></p>
              </div>
              <div className="divider" />
              <div>
                <span className="text-xs text-muted-dim tracking-wide uppercase">核心概念</span>
                <p className="text-white mt-2 leading-relaxed">我们以为在迁徙，其实是在逃离。每只候鸟体内都藏着一个赝品的秘密。</p>
              </div>
              <div className="divider" />
              <div>
                <span className="text-xs text-muted-dim tracking-wide uppercase">核心悖论</span>
                <p className="mt-2 font-medium text-gradient text-lg">飞得越远，离自己越近。</p>
              </div>
            </div>
          </div>

          <div className="card-glow p-6 animate-scale-in">
            <h2 className="section-header mb-5">评分总览</h2>
            <div className="space-y-5">
              {([
                ['概念原创性', 22],
                ['叙事连贯性', 24],
                ['市场潜力', 21],
                ['音乐一致性', 23],
              ]).map(([dim, score]) => (
                <div key={dim}>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="text-muted-dim">{dim}</span>
                    <span className="text-white font-semibold tabular-nums text-base">{score}<span className="text-muted-dark text-xs font-normal">/25</span></span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(score as number) / 25 * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-white/[0.06] pt-5 mt-3 flex justify-between items-center">
                <span className="text-white font-semibold text-base">总分</span>
                <span className="font-display text-4xl font-bold text-gradient tracking-tight">90<span className="text-muted-dark font-sans text-xl font-normal ml-1.5">/100</span></span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 animate-fade-in-up animate-delay-400 pt-2">
            <button onClick={handleApprove} disabled={loading} className="btn-primary flex-1">
              确认概念，进入单曲创作
            </button>
            <button onClick={handleReject} disabled={loading} className="btn-secondary flex-1">
              重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
