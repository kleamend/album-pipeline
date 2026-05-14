'use client';

import { useState } from 'react';

const TABS = ['歌词', '编曲', 'Sound Design', '押韵', '市场', '评分'];

interface Props {
  track: {
    id: string;
    index: number;
    title: string;
    score: number | null;
    status: string;
  };
}

export default function SongDetail({ track }: Props) {
  const [activeTab, setActiveTab] = useState(0);

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
          Round 1/6
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Lyrics tab */}
        {activeTab === 0 && (
          <div className="max-w-2xl space-y-6">
            <div className="card p-6 bg-surface-elevated/50">
              <h3 className="section-header mb-5">中文歌词</h3>
              <pre className="font-mono text-sm text-muted-light leading-loose whitespace-pre-wrap">
{'[Verse]\n第一行歌词内容\n第二行歌词内容\n\n[Pre Chorus]\n过渡段落\n\n[Hook]\n副歌核心句子\n重复加强记忆'}
              </pre>
              <div className="divider my-4" />
              <div className="text-xs text-muted-dim">字数: 1,234 / 3,500</div>
            </div>
            <div className="card p-6 bg-surface-elevated/50">
              <h3 className="section-header mb-5">English Lyrics</h3>
              <pre className="font-mono text-sm text-muted-light leading-loose whitespace-pre-wrap">
{'[Verse]\nFirst line of lyrics\nSecond line\n\n[Hook]\nThe chorus hook line'}
              </pre>
              <div className="divider my-4" />
              <div className="text-xs text-muted-dim">Chars: 890 / 3,500</div>
            </div>
          </div>
        )}

        {/* Arrangement tab */}
        {activeTab === 1 && (
          <div className="space-y-6 max-w-3xl">
            <div className="card p-5">
              <div className="flex items-center gap-8 mb-4">
                <div><span className="text-xs text-muted-dim">BPM</span><p className="text-white font-semibold text-lg">78</p></div>
                <div><span className="text-xs text-muted-dim">Key</span><p className="text-white font-semibold text-lg">Am</p></div>
                <div><span className="text-xs text-muted-dim">Style</span><p className="text-white font-semibold text-lg">Alternative Pop</p></div>
              </div>
            </div>
            {[
              { name: 'Intro', time: '0:00–0:24', desc: 'Solo electric piano, felt hammers, room ambience. Sparse and intimate.' },
              { name: 'Verse 1', time: '0:24–1:10', desc: 'Piano continues with ambient guitar swells entering at 0:40. Close-mic vocals, dry processing.' },
              { name: 'Pre-Chorus', time: '1:10–1:28', desc: 'Drums enter softly — kick drum on 1 and 3, brushes on snare. Tension building.' },
              { name: 'Chorus', time: '1:28–2:00', desc: 'Full band entry. String section layers in at 1:42. Backing vocal harmonies bloom.' },
              { name: 'Outro', time: '3:00–3:30', desc: 'Fade out with solo piano callback to intro. Reverb tail decays naturally.' },
            ].map((s, i) => (
              <div key={i} className="card p-5 border-l-2"
                style={{ borderLeftColor: 'transparent', borderImage: 'linear-gradient(to bottom, #fb923c, #f472b6) 1' }}>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {i + 1}. {s.name} <span className="text-muted-dim font-normal text-xs">{s.time}</span>
                </h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sound Design tab */}
        {activeTab === 2 && (
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
                  <tr className="border-b border-muted-border hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-medium">Vinyl Crackle</td><td className="p-4">Subtle vinyl noise for warmth</td><td className="p-4">Intro, Outro</td><td className="p-4 text-right font-mono text-xs">-24dB</td>
                  </tr>
                  <tr className="border-b border-muted-border bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 text-white font-medium">Reverse Reverb</td><td className="p-4">Reverse reverb swell into chorus</td><td className="p-4">Pre-Chorus → Chorus</td><td className="p-4 text-right font-mono text-xs">-12dB</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-medium">String Swell</td><td className="p-4">Gradual string section crescendo</td><td className="p-4">Chorus (1:42)</td><td className="p-4 text-right font-mono text-xs">-8dB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rhyme tab */}
        {activeTab === 3 && (
          <div className="max-w-2xl space-y-6">
            <div className="card overflow-hidden rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted-border bg-white/[0.02]">
                    <th className="text-left p-4 text-xs text-muted-dim font-medium">Rhyme</th><th className="text-left p-4 text-xs text-muted-dim font-medium">Sound</th><th className="text-left p-4 text-xs text-muted-dim font-medium">Position</th><th className="text-left p-4 text-xs text-muted-dim font-medium">Emotion</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-muted-border hover:bg-white/[0.02] transition-colors"><td className="p-4 text-white font-medium">-ang</td><td className="p-4">开口呼</td><td className="p-4">Verse, Hook</td><td className="p-4">释放、开阔</td></tr>
                  <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.01]"><td className="p-4 text-white font-medium">-u</td><td className="p-4">合口呼</td><td className="p-4">Bridge</td><td className="p-4">内敛、低沉</td></tr>
                </tbody>
              </table>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Hook 韵脚设计</h3>
              <p className="text-sm text-muted">连续 -ang 韵贯穿 Hook 段落，营造"飞翔/释放"的情绪统一性。</p>
            </div>
          </div>
        )}

        {/* Market tab */}
        {activeTab === 4 && (
          <div className="max-w-2xl space-y-6">
            <div className="card p-5 bg-gradient-to-r from-accent-orange/5 to-accent-pink/5">
              <span className="text-xs text-muted-dim">封面高光文案</span>
              <p className="text-lg font-display font-bold text-white mt-2">"我把笼子走成天空"</p>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">核心竞争力</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>· 核心悖论"自由是被困住的另一种形式"具有传播穿透力</li>
                <li>· Hook 段落旋律记忆度极高</li>
                <li>· 编曲中的反向混响设计增加了听觉新鲜感</li>
              </ul>
            </div>
          </div>
        )}

        {/* Scoring tab */}
        {activeTab === 5 && (
          <div className="max-w-2xl space-y-6">
            <div className="card p-6">
              <div className="space-y-5">
                {[
                  ['韵律', 16, 20],
                  ['市场', 17, 20],
                  ['结构', 18, 20],
                  ['哲学', 19, 20],
                  ['编曲', 15, 20],
                ].map(([dim, score, max]) => {
                  const pct = (Number(score) / Number(max)) * 100;
                  return (
                    <div key={dim as string}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">{dim as string}</span>
                        <span className="text-white font-medium">{String(score)}/{String(max)}</span>
                      </div>
                      <div className="progress-bar h-2.5">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="divider my-6" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white font-semibold">总分</span>
                <span className="text-3xl font-bold text-gradient">85/100</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
