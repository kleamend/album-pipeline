'use client';

import { useState } from 'react';

const TABS = ['🎨 封面', '🎬 宣传视频', '📝 宣传文案', '🎤 艺人故事', '🔍 平台检查'];

interface Props {
  albumId: string;
}

export default function ReleasePanel({ albumId }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-surface-border bg-surface-light/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white">Phase 6 · 发布物料</h1>
            <p className="text-xs text-muted-dim mt-1">封面 · 视频 · 文案 · 艺人故事 · 平台检查</p>
          </div>
          <button className="btn-primary text-sm px-6 py-2">导出发布包</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-surface-border px-8">
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-5 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
              i === activeTab ? 'text-accent-orange border-accent-orange' : 'text-muted-dim border-transparent hover:text-muted'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Cover tab */}
        {activeTab === 0 && (
          <div className="flex gap-8">
            <div className="w-60 space-y-3">
              <h3 className="text-xs text-muted-dim uppercase tracking-widest">封面方案</h3>
              {['方案 A · 概念忠实型', '方案 B · 情绪氛围型', '方案 C · 极简符号型'].map((name, i) => (
                <div key={i} className={`p-3 rounded-lg border cursor-pointer text-xs ${i === 0 ? 'border-accent-orange/30 bg-accent-orange/5' : 'border-surface-border bg-surface-light'}`}>
                  <div className="text-white font-medium">{name}</div>
                  <div className="flex gap-1 mt-2">
                    <span className="w-3 h-3 rounded-sm bg-accent-orange" />
                    <span className="w-3 h-3 rounded-sm bg-accent-pink" />
                    <span className="w-3 h-3 rounded-sm bg-muted" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h3 className="text-xs text-muted-dim uppercase tracking-widest mb-4">生成结果</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="aspect-square rounded-xl bg-gradient-to-br from-accent-orange/15 to-accent-pink/10 border border-surface-border flex items-center justify-center">
                    <span className="text-muted-dim text-xs">封面 P{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video tab */}
        {activeTab === 1 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-orange/10 to-accent-pink/10 border border-surface-border flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎬</span>
            </div>
            <p className="text-sm text-muted-dim">6 秒宣传视频 · 以专辑封面为首帧</p>
          </div>
        )}

        {/* Copy tab */}
        {activeTab === 2 && (
          <div className="max-w-3xl space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-white mb-3">新闻稿</h3>
              <p className="text-sm text-muted leading-relaxed">
                专辑文案将在此展示。系统将基于专辑概念、核心悖论和曲目亮点自动生成宣传材料。
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-white mb-3">社交媒体文案</h3>
              <div className="space-y-2 text-sm text-muted">
                <p>· 短文 1</p><p>· 短文 2</p><p>· 短文 3</p>
              </div>
            </div>
          </div>
        )}

        {/* Artist story tab */}
        {activeTab === 3 && (
          <div className="max-w-3xl space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-white mb-3">艺人故事 · 中文长版</h3>
              <p className="text-sm text-muted leading-relaxed">~1,800 字符的创作故事将在此展示。</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-white mb-3">金句摘录（5 组中英对照）</h3>
              <div className="space-y-2 text-sm text-muted">
                <p>1. &quot;... &quot; / &quot;...&quot;</p><p>2. &quot;... &quot; / &quot;...&quot;</p>
              </div>
            </div>
          </div>
        )}

        {/* Platform check tab */}
        {activeTab === 4 && (
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-6">
              {['网易云音乐', 'QQ 音乐'].map((platform) => (
                <div key={platform} className="card p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">{platform}</h3>
                  <div className="space-y-2 text-xs">
                    {['格式: MP3 320kbps', '采样率: 44.1kHz', '响度: -14 LUFS', '时长: 60s-360s', '曲目数: >= 3'].map((check) => (
                      <div key={check} className="flex items-center gap-2 text-green-400">
                        <span>✓</span><span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
