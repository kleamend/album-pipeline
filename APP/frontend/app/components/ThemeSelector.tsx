'use client';

import { useState } from 'react';

const THEMES = [
  { id: 'warm-vinyl', name: '暖色唱片', char: '🎵', dark: true },
  { id: 'batman', name: '蝙蝠侠', char: '🦇', dark: true },
  { id: 'joker', name: '小丑', char: '🃏', dark: true },
  { id: 'vader', name: '达斯维达', char: '⚔️', dark: true },
  { id: 'mickey', name: '午夜米奇', char: '🐭', dark: true },
  { id: 'doraemon', name: '哆啦A梦', char: '🔔', dark: false },
  { id: 'snoopy', name: '史努比', char: '🏠', dark: false },
  { id: 'buzz', name: '巴斯光年', char: '🚀', dark: false },
  { id: 'pikachu', name: '皮卡丘', char: '⚡', dark: false },
];

export default function ThemeSelector() {
  const [current, setCurrent] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'warm-vinyl' : 'warm-vinyl'
  );
  const [mode, setMode] = useState<'fixed' | 'random'>('fixed');

  const applyTheme = (themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrent(themeId);
    localStorage.setItem('album-pipeline-theme', themeId);
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: themeId }),
    }).catch(() => {});
  };

  return (
    <div className="card-glow p-6">
      <h2 className="section-header mb-2">主题配色</h2>
      <p className="text-xs text-muted-dim mb-5 mt-2">选择一个角色主题或开启随机轮换</p>

      {/* Mode toggle */}
      <div className="flex gap-3 mb-5">
        <label className="flex items-center gap-2 text-xs text-muted-dim cursor-pointer">
          <input type="radio" name="themeMode" checked={mode === 'fixed'} onChange={() => setMode('fixed')} />
          固定主题
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-dim cursor-pointer">
          <input type="radio" name="themeMode" checked={mode === 'random'} onChange={() => setMode('random')} />
          每次随机
        </label>
      </div>

      {/* Theme cards */}
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTheme(t.id)}
            className={`p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
              current === t.id
                ? 'border-accent-orange/40 bg-accent-orange/5 shadow-glow-sm'
                : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <div className="text-lg mb-1">{t.char}</div>
            <div className="text-[10px] font-medium text-muted">{t.name}</div>
            <div className="text-[9px] text-muted-dim">{t.dark ? '暗色' : '亮色'}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
