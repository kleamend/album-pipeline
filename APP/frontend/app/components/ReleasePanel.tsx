'use client';

import { useEffect, useState } from 'react';

const TABS = ['🎨 封面', '🎬 宣传视频', '📝 宣传文案', '🎤 艺人故事', '🔍 平台检查'];

interface Props {
  albumId: string;
}

export default function ReleasePanel({ albumId }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/albums/' + albumId + '/deliverables')
      .then(res => res.json())
      .then(data => {/* update deliverable statuses */})
      .catch(() => {});
  }, [albumId]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-muted-border bg-surface-light/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="badge-accent">Phase 6</span>
              <h1 className="section-header !text-xs !mb-0">发布物料</h1>
            </div>
            <p className="text-xs text-muted-dim mt-1">封面 · 视频 · 文案 · 艺人故事 · 平台检查</p>
          </div>
          <button className="btn-primary text-sm px-6 py-2 animate-pulse-soft">导出发布包</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-muted-border px-8">
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`relative px-5 py-3 text-xs font-medium transition-all duration-300 ${
              i === activeTab ? 'text-accent-orange' : 'text-muted-dim hover:text-muted'
            }`}>
            {label}
            {i === activeTab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-accent-orange to-accent-pink shadow-glow-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Cover tab */}
        {activeTab === 0 && (
          <div className="flex gap-8">
            <div className="w-60 space-y-3">
              <h3 className="section-header mb-4">封面方案</h3>
              {[
                { name: '方案 A · 概念忠实型', colors: ['#fb923c', '#f472b6', '#c084fc'] },
                { name: '方案 B · 情绪氛围型', colors: ['#f97316', '#ec4899', '#6366f1'] },
                { name: '方案 C · 极简符号型', colors: ['#ffffff', '#94a3b8', '#1e293b'] },
              ].map((item, i) => (
                <div key={i} className={`card p-4 cursor-pointer ${i === 0 ? 'border-accent-orange/30 bg-accent-orange/[0.04]' : ''}`}>
                  <div className="text-xs text-white font-medium mb-2">{item.name}</div>
                  <div className="flex gap-1.5">
                    {item.colors.map((c, ci) => (
                      <span key={ci} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h3 className="section-header mb-4">生成结果</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="card-glow aspect-square flex items-center justify-center group cursor-pointer">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange/20 to-accent-pink/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xs text-accent-orange font-display font-bold">P{n}</span>
                      </div>
                      <span className="text-muted-dim text-xs group-hover:text-muted transition-colors">封面 {n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video tab */}
        {activeTab === 1 && (
          <div className="text-center py-20">
            <div className="vinyl-accent mb-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-orange/10 to-accent-pink/10 border-2 border-accent-orange/20 shadow-glow-md flex items-center justify-center mx-auto animate-float">
                <svg className="w-12 h-12 text-accent-orange/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="18" rx="3" />
                  <path d="M9 8l7 4-7 4V8z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-lg font-semibold text-white mb-2">宣传视频生成</h2>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
              6 秒宣传视频 · 以专辑封面为首帧 · 配合 Hook 段落音频 · 自动适配短视频平台比例
            </p>
          </div>
        )}

        {/* Copy tab */}
        {activeTab === 2 && (
          <div className="max-w-3xl space-y-6">
            <div className="card-glow p-6">
              <h3 className="section-header mb-4">新闻稿</h3>
              <p className="text-sm text-muted-light leading-relaxed">
                专辑文案将在此展示。系统将基于专辑概念、核心悖论和曲目亮点自动生成宣传材料。
              </p>
            </div>
            <div className="card-glow p-6">
              <h3 className="section-header mb-4">社交媒体文案</h3>
              <div className="space-y-3 text-sm text-muted-light">
                <div className="card p-3 bg-surface-elevated/50">
                  <span className="badge-accent text-[10px] mr-2">短文 1</span>
                  <span className="text-muted-light">核心悖论短文案</span>
                </div>
                <div className="card p-3 bg-surface-elevated/50">
                  <span className="badge-accent text-[10px] mr-2">短文 2</span>
                  <span className="text-muted-light">Hook 段落引用</span>
                </div>
                <div className="card p-3 bg-surface-elevated/50">
                  <span className="badge-accent text-[10px] mr-2">短文 3</span>
                  <span className="text-muted-light">制作幕后花絮</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artist story tab */}
        {activeTab === 3 && (
          <div className="max-w-3xl space-y-6">
            <div className="card-glow p-6">
              <h3 className="section-header mb-4">艺人故事 · 中文长版</h3>
              <p className="text-sm text-muted-light leading-relaxed">~1,800 字符的创作故事将在此展示，涵盖专辑哲学背景与艺人创作心路。</p>
              <div className="divider my-5" />
              <div className="text-xs text-muted-dim">预计阅读时长: 6 分钟</div>
            </div>
            <div className="card-glow p-6">
              <h3 className="section-header mb-4">金句摘录（5 组中英对照）</h3>
              <div className="space-y-3">
                <div className="card p-4 bg-surface-elevated/50 border-l-2" style={{ borderLeftColor: 'transparent', borderImage: 'linear-gradient(to bottom, #fb923c, #f472b6) 1' }}>
                  <p className="text-sm text-white font-medium">"我把笼子走成天空"</p>
                  <p className="text-xs text-muted mt-1 font-mono">"I walked my cage into the sky"</p>
                </div>
                <div className="card p-4 bg-surface-elevated/50 border-l-2" style={{ borderLeftColor: 'transparent', borderImage: 'linear-gradient(to bottom, #fb923c, #f472b6) 1' }}>
                  <p className="text-sm text-white font-medium">"自由是被困住的另一种形式"</p>
                  <p className="text-xs text-muted mt-1 font-mono">"Freedom is another form of being trapped"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform check tab */}
        {activeTab === 4 && (
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: '网易云音乐', checks: [
                  { label: '格式: MP3 320kbps', pass: true },
                  { label: '采样率: 44.1kHz', pass: true },
                  { label: '响度: -14 LUFS', pass: true },
                  { label: '时长: 60s-360s', pass: true },
                  { label: '曲目数: >= 3', pass: true },
                ]},
                { name: 'QQ 音乐', checks: [
                  { label: '格式: MP3 320kbps', pass: true },
                  { label: '采样率: 44.1kHz', pass: true },
                  { label: '响度: -14 LUFS', pass: true },
                  { label: '时长: 60s-360s', pass: true },
                  { label: '封面分辨率: >= 3000px', pass: false },
                ]},
              ].map((platform) => (
                <div key={platform.name} className="card-glow p-6">
                  <h3 className="section-header mb-5">{platform.name}</h3>
                  <div className="space-y-2.5">
                    {platform.checks.map((check) => (
                      <div key={check.label} className={`flex items-center gap-2 text-xs ${check.pass ? 'badge-success' : 'badge-error'} px-3 py-1.5`}>
                        <span>{check.pass ? '✓' : '✗'}</span>
                        <span>{check.label}</span>
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
