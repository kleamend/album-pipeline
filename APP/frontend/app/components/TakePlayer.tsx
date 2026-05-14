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
      <div className="px-8 py-5 border-b border-surface-border bg-surface-light/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white">Phase 5 · 听选与转码</h1>
            <p className="text-xs text-muted-dim mt-1">每首歌对比 3 个 Take，选择最佳版本</p>
          </div>
          <span className="px-3 py-1 bg-green-400/10 text-green-400 rounded-full text-xs">
            {Object.keys(selections).length}/{tracks.length} 已选定
          </span>
        </div>

        {/* Track pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {tracks.map((t, i) => (
            <button
              key={t.track_id}
              onClick={() => setCurrentTrackIdx(i)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === currentTrackIdx
                  ? 'bg-accent-orange/10 border border-accent-orange/30 text-accent-orange'
                  : selections[t.track_id]
                  ? 'bg-green-400/10 border border-green-400/20 text-green-400'
                  : 'bg-surface-light border border-surface-border text-muted-dim'
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
            {/* Album art placeholder */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-accent-orange/20 to-accent-pink/10 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-accent-orange/30">
                  {String(currentTrack.index).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{currentTrack.title}</h2>
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
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-green-400/5 border-green-400/20'
                        : 'bg-surface-light border-surface-border hover:border-accent-orange/20'
                    }`}
                    onClick={() => {
                      setSelections((s) => ({ ...s, [currentTrack.track_id]: v.version }));
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg">
                        ▶
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">{v.version.toUpperCase()} · {v.strategy}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-green-400/15 text-green-400 rounded text-[10px]">已选定</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-dim mt-2">
                          ~4.2 MB · 03:24 · 320kbps · 44.1kHz
                        </div>
                        {/* Waveform visualization placeholder */}
                        <div className="flex items-end gap-0.5 h-8 mt-3">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 rounded-sm"
                              style={{
                                height: `${12 + Math.random() * 20}px`,
                                background: isSelected
                                  ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                                  : 'linear-gradient(180deg, #94a3b8, #64748b)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center pl-4 border-l border-surface-border">
                        <div className={`text-lg font-bold ${isSelected ? 'text-green-400' : 'text-muted'}`}>
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
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-surface-border">
              <div className="flex gap-2 text-xs text-muted-dim">
                <kbd className="px-2 py-0.5 bg-surface-border rounded text-[10px]">1/2/3</kbd>
                <span>切换播放</span>
                <kbd className="px-2 py-0.5 bg-surface-border rounded text-[10px] ml-3">Enter</kbd>
                <span>确认选择</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentTrackIdx(Math.max(0, currentTrackIdx - 1))}
                  disabled={currentTrackIdx === 0}
                  className="btn-secondary text-xs px-4 py-2"
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
