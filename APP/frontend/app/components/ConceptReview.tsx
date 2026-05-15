'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';

interface Props {
  albumId: string;
}

const EXPERT_NAMES: Record<string, string> = {
  creative: '创意总监',
  market: '市场专家',
  music: '音乐总监',
};

export default function ConceptReview({ albumId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setStarted(true);
    try {
      const data = await api.executePhase1(albumId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || '生成失败，请检查 API Key 和网络连接');
      setStarted(false);
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
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          <button onClick={handleStart} disabled={loading} className="btn-primary">
            {loading ? '正在生成...' : '开始概念生成'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {loading && !result && (
            <div className="card-glow p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-3 h-3 bg-accent-orange rounded-full animate-pulse-soft shadow-[0_0_10px_rgba(251,146,60,0.6)]" />
                <span className="text-sm font-medium text-white">概念生成中...</span>
              </div>
              <p className="text-sm text-muted-dim mb-4">
                正在调用 LLM 生成专辑概念，3 个专家并行工作，随后主评审评分。请稍候...
              </p>
              <div className="flex gap-2 pt-2">
                {['creative', 'market', 'music'].map((key, i) => (
                  <div key={key} className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-dim">{EXPERT_NAMES[key]}</span>
                      <span className="text-muted-dark">···</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-orange/30 animate-shimmer"
                        style={{ width: `${20 + i * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-dim mt-4 animate-pulse-soft">
                等待 LLM 响应中...
              </p>
            </div>
          )}

          {result && (() => {
            const creative = result?.results?.creative;
            const review = result?.review;
            if (!creative) return null;
            return (
            <>
              <div className="card-glow p-6 animate-fade-in-up">
                <div className="section-header mb-5">核心概念</div>
                <div className="space-y-5">
                  <div>
                    <span className="text-xs text-muted-dim tracking-wide uppercase">专辑名称</span>
                    <p className="text-white font-display text-xl font-semibold mt-2">
                      《{creative.album_name_cn}》
                      <span className="text-muted-dim font-sans text-sm font-normal">/ {creative.album_name_en}</span>
                    </p>
                  </div>
                  <div className="divider" />
                  <div>
                    <span className="text-xs text-muted-dim tracking-wide uppercase">核心概念</span>
                    <p className="text-white mt-2 leading-relaxed">{creative.core_concept}</p>
                  </div>
                  <div className="divider" />
                  <div>
                    <span className="text-xs text-muted-dim tracking-wide uppercase">核心悖论</span>
                    <p className="mt-2 font-medium text-gradient text-lg">{creative.core_paradox}</p>
                  </div>
                  {(creative.narrative_axes?.length ?? 0) > 0 && (
                    <>
                      <div className="divider" />
                      <div>
                        <span className="text-xs text-muted-dim tracking-wide uppercase">叙事弧线</span>
                        <div className="mt-3 space-y-2">
                          {creative.narrative_axes.map((axis: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-accent-orange font-medium shrink-0">{axis.name}</span>
                              <span className="text-muted-dim">— {axis.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {(creative.tracks?.length ?? 0) > 0 && (
                <div className="card-glow p-6 animate-fade-in-up animate-delay-200">
                  <h2 className="section-header mb-4">曲目列表</h2>
                  <div className="space-y-2">
                    {creative.tracks.map((t: any) => (
                      <div key={t.index} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-xs text-muted-dim font-mono w-8">{String(t.index).padStart(2, '0')}</span>
                        <div className="flex-1">
                          <span className="text-sm text-white font-medium">{t.name}</span>
                          {t.english_name && <span className="text-xs text-muted-dim ml-2">/ {t.english_name}</span>}
                        </div>
                        {t.core_hook && (
                          <span className="text-xs text-accent-orange bg-accent-orange/5 px-2 py-0.5 rounded">{t.core_hook}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {review && (
                <div className="card-glow p-6 animate-scale-in">
                  <h2 className="section-header mb-5">评分总览</h2>
                  <div className="space-y-5">
                    {([
                      ['概念原创性', review.conceptual_originality || 0],
                      ['叙事连贯性', review.narrative_coherence || 0],
                      ['市场潜力', review.market_potential || 0],
                      ['音乐一致性', review.musical_consistency || 0],
                    ]).map(([dim, score]) => (
                      <div key={dim}>
                        <div className="flex justify-between items-baseline text-sm mb-2">
                          <span className="text-muted-dim">{dim}</span>
                          <span className="text-white font-semibold tabular-nums text-base">{score}<span className="text-muted-dark text-xs font-normal">/25</span></span>
                        </div>
                        <div className="progress-bar h-2">
                          <div className="progress-bar-fill" style={{ width: `${(Number(score) / 25 * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-white/[0.06] pt-5 mt-3 flex justify-between items-center">
                      <span className="text-white font-semibold text-base">总分</span>
                      <span className="font-display text-4xl font-bold text-gradient tracking-tight">{review.total || 0}<span className="text-muted-dark font-sans text-xl font-normal ml-1.5">/100</span></span>
                    </div>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="card-glow p-4 border border-red-500/20 animate-fade-in-up">
                  <p className="text-xs text-red-400 font-medium mb-2">部分专家执行出错：</p>
                  {result.errors.map((err: string, i: number) => (
                    <p key={i} className="text-xs text-red-400/70">{err}</p>
                  ))}
                </div>
              )}
            </>
          );})()}

          {error && (
            <div className="card-glow p-4 border border-red-500/20 animate-fade-in-up">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

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
