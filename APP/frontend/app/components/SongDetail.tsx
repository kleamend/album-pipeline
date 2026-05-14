'use client';

import { useState } from 'react';

const TABS = ['歌词', '编曲', 'Sound Design', '押韵', '市场', '评分'];

interface RoundData {
  round: number;
  agents: Record<string, { status: string; output_json: string | null; score?: number }>;
  final_score: number | null;
}

interface Props {
  track: {
    id: string;
    index: number;
    title: string;
    score: number | null;
    status: string;
    core_hook?: string;
    emotional_arc?: string;
    arrangement_style?: string;
  };
  rounds: RoundData[];
}

function getLatestAgentOutput(rounds: RoundData[], agentName: string): any | null {
  for (let i = rounds.length - 1; i >= 0; i--) {
    const agent = rounds[i].agents?.[agentName];
    if (agent?.output_json) {
      try { return JSON.parse(agent.output_json); } catch { continue; }
    }
  }
  return null;
}

function getLatestRoundNumber(rounds: RoundData[]): number {
  if (rounds.length === 0) return 0;
  return rounds[rounds.length - 1].round;
}

export default function SongDetail({ track, rounds }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const lyricsData = getLatestAgentOutput(rounds, 'phase2_lyrics');
  const arrangementData = getLatestAgentOutput(rounds, 'phase2_arrangement');
  const soundDesignData = getLatestAgentOutput(rounds, 'phase2_sound_design');
  const rhymeData = getLatestAgentOutput(rounds, 'phase2_rhyme');
  const marketData = getLatestAgentOutput(rounds, 'phase2_market');
  const scoringData = getLatestAgentOutput(rounds, 'phase2_scoring');

  const currentRound = getLatestRoundNumber(rounds);
  const noData = rounds.length === 0;

  const emptyMessage = (agentName: string) => (
    <div className="max-w-2xl">
      <div className="card p-8 text-center">
        <p className="text-muted-dim text-sm">
          {noData ? '尚未生成 — 请先运行 Phase 2' : `Phase 2 ${agentName} 数据尚未生成`}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-muted-border bg-surface-light/50">
        <div className="flex items-center gap-5">
          <div className="vinyl-accent">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-pink/15 flex items-center justify-center border-2 border-accent-orange/20 shadow-glow-sm">
              <span className="font-display text-2xl font-bold text-gradient animate-fade-in">
                {String(track.index).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{track.title}</h1>
            <p className="text-xs text-muted mt-1">
              Track {track.index} · 状态: {track.status}
              {track.score != null && (
                <span className="ml-3 text-gradient font-semibold text-sm">{track.score}分</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-muted-border px-8">
        {TABS.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`relative px-5 py-3 text-xs font-medium transition-all duration-300 ${
              i === activeTab
                ? 'text-accent-orange'
                : 'text-muted-dim hover:text-muted'
            }`}
          >
            {label}
            {i === activeTab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-accent-orange to-accent-pink shadow-glow-sm" />
            )}
          </button>
        ))}
        <div className="flex-1" />
        <span className="flex items-center text-xs text-muted-dim">
          Round {currentRound}/6
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Lyrics tab */}
        {activeTab === 0 && (
          lyricsData ? (
            <div className="max-w-2xl space-y-6">
              <div className="card p-6 bg-surface-elevated/50">
                <h3 className="section-header mb-5">中文歌词</h3>
                <pre className="font-mono text-sm text-muted-light leading-loose whitespace-pre-wrap">
                  {lyricsData.chinese_lyrics || lyricsData.lyrics || lyricsData.zh_lyrics || '暂无中文歌词'}
                </pre>
                {lyricsData.zh_char_count != null && (
                  <div className="divider my-4" />
                )}
                {lyricsData.zh_char_count != null && (
                  <div className="text-xs text-muted-dim">字数: {lyricsData.zh_char_count} / {lyricsData.zh_char_limit || '3,500'}</div>
                )}
              </div>
              <div className="card p-6 bg-surface-elevated/50">
                <h3 className="section-header mb-5">English Lyrics</h3>
                <pre className="font-mono text-sm text-muted-light leading-loose whitespace-pre-wrap">
                  {lyricsData.english_lyrics || lyricsData.en_lyrics || '暂无英文歌词'}
                </pre>
                {lyricsData.en_char_count != null && (
                  <div className="divider my-4" />
                )}
                {lyricsData.en_char_count != null && (
                  <div className="text-xs text-muted-dim">Chars: {lyricsData.en_char_count} / {lyricsData.en_char_limit || '3,500'}</div>
                )}
              </div>
            </div>
          ) : emptyMessage('歌词')
        )}

        {/* Arrangement tab */}
        {activeTab === 1 && (
          arrangementData ? (
            <div className="space-y-6 max-w-3xl">
              <div className="card p-5">
                <div className="flex items-center gap-8 mb-4">
                  {arrangementData.bpm != null && (
                    <div><span className="text-xs text-muted-dim">BPM</span><p className="text-white font-semibold text-lg">{arrangementData.bpm}</p></div>
                  )}
                  {arrangementData.key && (
                    <div><span className="text-xs text-muted-dim">Key</span><p className="text-white font-semibold text-lg">{arrangementData.key}</p></div>
                  )}
                  {arrangementData.style && (
                    <div><span className="text-xs text-muted-dim">Style</span><p className="text-white font-semibold text-lg">{arrangementData.style}</p></div>
                  )}
                </div>
              </div>
              {(arrangementData.sections || []).map((s: any, i: number) => (
                <div key={i} className="card p-5 border-l-2"
                  style={{ borderLeftColor: 'transparent', borderImage: 'linear-gradient(to bottom, #fb923c, #f472b6) 1' }}>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {i + 1}. {s.name || s.section} <span className="text-muted-dim font-normal text-xs">{s.time || s.start || ''}</span>
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc || s.description || ''}</p>
                </div>
              ))}
            </div>
          ) : emptyMessage('编曲')
        )}

        {/* Sound Design tab */}
        {activeTab === 2 && (
          soundDesignData ? (
            <div className="max-w-2xl">
              <div className="card overflow-hidden rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted-border bg-white/[0.02]">
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Sound</th>
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Description</th>
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Position</th>
                      <th className="text-right p-4 text-xs text-muted-dim font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {(soundDesignData.sounds || soundDesignData.items || []).map((s: any, i: number) => (
                      <tr key={i} className={`border-b border-muted-border hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                        <td className="p-4 text-white font-medium">{s.name || s.sound}</td>
                        <td className="p-4">{s.desc || s.description}</td>
                        <td className="p-4">{s.position || s.section}</td>
                        <td className="p-4 text-right font-mono text-xs">{s.volume || s.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : emptyMessage('Sound Design')
        )}

        {/* Rhyme tab */}
        {activeTab === 3 && (
          rhymeData ? (
            <div className="max-w-2xl space-y-6">
              <div className="card overflow-hidden rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted-border bg-white/[0.02]">
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Rhyme</th>
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Sound</th>
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Position</th>
                      <th className="text-left p-4 text-xs text-muted-dim font-medium">Emotion</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {(rhymeData.rhymes || rhymeData.items || []).map((r: any, i: number) => (
                      <tr key={i} className={`border-b border-muted-border hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                        <td className="p-4 text-white font-medium">{r.rhyme || r.name}</td>
                        <td className="p-4">{r.sound || r.type}</td>
                        <td className="p-4">{r.position || r.location}</td>
                        <td className="p-4">{r.emotion || r.mood}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rhymeData.hook_design && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Hook 韵脚设计</h3>
                  <p className="text-sm text-muted">{rhymeData.hook_design}</p>
                </div>
              )}
            </div>
          ) : emptyMessage('押韵')
        )}

        {/* Market tab */}
        {activeTab === 4 && (
          marketData ? (
            <div className="max-w-2xl space-y-6">
              {marketData.highlight && (
                <div className="card p-5 bg-gradient-to-r from-accent-orange/5 to-accent-pink/5">
                  <span className="text-xs text-muted-dim">封面高光文案</span>
                  <p className="text-lg font-display font-bold text-white mt-2">{marketData.highlight}</p>
                </div>
              )}
              {marketData.core_competitiveness || marketData.advantages ? (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">核心竞争力</h3>
                  <ul className="space-y-2 text-sm text-muted">
                    {(marketData.core_competitiveness || marketData.advantages || []).map((a: any, i: number) => (
                      <li key={i}>· {typeof a === 'string' ? a : a.point || a.text || a.desc}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : emptyMessage('市场')
        )}

        {/* Scoring tab */}
        {activeTab === 5 && (
          scoringData ? (
            <div className="max-w-2xl space-y-6">
              <div className="card p-6">
                <div className="space-y-5">
                  {(scoringData.dimensions || scoringData.scores || []).map((d: any) => {
                    const score = d.score ?? d.value ?? 0;
                    const max = d.max ?? d.max_score ?? 20;
                    const pct = max > 0 ? (score / max) * 100 : 0;
                    return (
                      <div key={d.name || d.dimension}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted">{d.name || d.dimension}</span>
                          <span className="text-white font-medium">{score}/{max}</span>
                        </div>
                        <div className="progress-bar h-2.5">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="divider my-6" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white font-semibold">总分</span>
                  <span className="text-3xl font-bold text-gradient">
                    {scoringData.total_score ?? scoringData.total ?? 0}/{scoringData.max_total ?? scoringData.total_max ?? 100}
                  </span>
                </div>
              </div>
            </div>
          ) : emptyMessage('评分')
        )}
      </div>
    </div>
  );
}
