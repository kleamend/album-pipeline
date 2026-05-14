'use client';

import { useState } from 'react';

interface TakeVersion {
  id: string;
  version: string;
  strategy: string;
  selected: boolean;
}

interface TrackInfo {
  track_id: string;
  index: number;
  title: string;
  versions: TakeVersion[];
}

interface Props {
  albumId: string;
}

export default function TakePlayer({ albumId }: Props) {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const currentTrack = tracks[currentTrackIdx];
  const selectedVersion = currentTrack ? selections[currentTrack.track_id] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-muted-border bg-surface-light/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="badge-accent">Phase 5</span>
              <h1 className="section-header !text-xs !mb-0">听选与转码</h1>
            </div>
            <p className="text-xs text-muted-dim mt-1">每首歌对比 3 个 Take，选择最佳版本</p>
          </div>
          <span className={`badge ${Object.keys(selections).length === tracks.length ? 'badge-success' : 'badge-info'}`}>
            {Object.keys(selections).length}/{tracks.length} 已选定
          </span>
        </div>

        {/* Track pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tracks.map((t, i) => (
            <button
              key={t.track_id}
              onClick={() => setCurrentTrackIdx(i)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                i === currentTrackIdx
                  ? 'bg-accent-orange/15 border border-accent-orange/40 text-accent-orange shadow-glow-sm'
                  : selections[t.track_id]
                  ? 'badge-success'
                  : 'bg-surface-elevated border border-muted-border text-muted-dim hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {String(t.index).padStart(2, '0')} · {t.title}
              {selections[t.track_id] && ' ✓'}
            </button>
          ))}
        </div>
      </div>

      {/* Take comparison */}
      <div className="flex-1 overflow-y-auto p-8">
        {currentTrack ? (
          <div>
            {/* Album art placeholder - vinyl inspired */}
            <div className="flex items-center gap-6 mb-8">
              <div className="vinyl-accent">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center relative shadow-glow-md">
                  {/* Concentric rings */}
                  <div className="absolute inset-2.5 rounded-full border border-white/[0.06]" />
                  <div className="absolute inset-5 rounded-full border border-white/[0.04]" />
                  <div className="absolute inset-9 rounded-full bg-accent-orange/10 flex items-center justify-center">
                    <span className="font-display text-xl font-bold text-gradient">
                      {String(currentTrack.index).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">{currentTrack.title}</h2>
                <p className="text-xs text-muted-dim mt-1">3 个 Take 版本 · 键盘快捷键 1/2/3 切换播放 · Enter 确认</p>
              </div>
            </div>

            {/* 3 takes */}
            <div className="space-y-4">
              {currentTrack.versions.map((v) => {
                const isSelected = selections[currentTrack.track_id] === v.version;
                return (
                  <div
                    key={v.id}
                    className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/[0.04] border-emerald-400/30 shadow-glow-sm'
                        : 'bg-surface-elevated border-muted-border hover:border-white/[0.12] hover:bg-white/[0.03] shadow-card hover:shadow-card-hover'
                    }`}
                    onClick={() => {
                      setSelections((s) => ({ ...s, [currentTrack.track_id]: v.version }));
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                        isSelected ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/[0.04] text-muted-dim'
                      }`}>
                        ▶
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">{v.version.toUpperCase()} · {v.strategy}</span>
                          {isSelected && (
                            <span className="badge-success text-[10px] px-2 py-0.5">已选定</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-dim mt-2 font-mono">
                          ~4.2 MB · 03:24 · 320kbps · 44.1kHz
                        </div>
                        {/* Waveform visualization */}
                        <div className="flex items-end gap-0.5 h-8 mt-3">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 rounded-sm"
                              style={{
                                height: `${12 + Math.sin(i * 0.7) * 6 + Math.random() * 14}px`,
                                background: isSelected
                                  ? 'linear-gradient(180deg, #34d399, #10b981, #059669)'
                                  : 'linear-gradient(180deg, #fb923c, #f97316, #f472b6)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center pl-4 border-l border-muted-border">
                        <div className={`text-lg font-bold ${isSelected ? 'text-gradient' : 'text-muted'}`}>
                          {v.version === 'p1' ? '92' : v.version === 'p2' ? '88' : '85'}
                        </div>
                        <div className="text-[10px] text-muted-dim">P2 评分</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-muted-border">
              <div className="flex items-center gap-3 text-xs text-muted-dim">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-muted-border rounded text-[10px] text-muted-light font-mono">1</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-muted-border rounded text-[10px] text-muted-light font-mono">2</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-muted-border rounded text-[10px] text-muted-light font-mono">3</kbd>
                </div>
                <span>切换播放</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-muted-border rounded text-[10px] text-muted-light font-mono">Enter</kbd>
                </div>
                <span>确认选择</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentTrackIdx(Math.max(0, currentTrackIdx - 1))}
                  disabled={currentTrackIdx === 0}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  ← 上一首
                </button>
                <button
                  onClick={() => {
                    if (selectedVersion) {
                      setCurrentTrackIdx(Math.min(tracks.length - 1, currentTrackIdx + 1));
                    }
                  }}
                  disabled={!selectedVersion}
                  className="btn-primary text-xs px-6 py-2"
                >
                  确认选择 · 下一首 →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-orange/10 to-accent-pink/10 border border-surface-border flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎧</span>
              </div>
              <p className="text-muted-dim text-sm">加载 Take 列表中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
