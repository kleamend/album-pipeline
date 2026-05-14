'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import type { LanguageMode } from '@/src/types';

const STEPS = ['核心主题', '曲目 & 语言', '风格 & 听众', '发布计划', '确认创建'];

export default function NewAlbumWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    theme: '',
    notes: '',
    trackCount: 3,
    language: 'chinese' as LanguageMode,
    hasInstrumental: false,
    referenceStyle: '',
    targetAudience: '',
    publishTarget: 'none' as 'netease' | 'qq' | 'none',
    generateCover: true,
    generateVideo: false,
    generateCopy: true,
  });

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const album = await api.createAlbum(form);
      router.push(`/albums/${album.id}/concept`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap px-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`relative transition-all duration-500 text-xs font-medium rounded-full px-3.5 py-1.5 border ${
                i === step
                  ? 'border-accent-orange/30 text-accent-orange'
                  : i < step
                  ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
                  : 'border-transparent text-muted-dim'
              }`}
            >
              {i < step ? (
                <span className="inline-flex items-center gap-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {label}
                </span>
              ) : (
                <>{i + 1}. {label}</>
              )}
              {/* Glowing underline for current step */}
              {i === step && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-gradient-to-r from-accent-orange via-accent-warm to-accent-pink shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-5 h-px rounded-full transition-all duration-500 ${
                i < step ? 'bg-emerald-500/30' : i === step ? 'bg-accent-orange/20' : 'bg-white/[0.04]'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="p-8"
        >
          {/* Step 0: Core theme */}
          {step === 0 && (
            <div>
              <h2 className="section-header mb-4">核心主题</h2>
              <p className="text-lg font-semibold text-white mb-2">你想做什么样的专辑？</p>
              <p className="text-muted-dim text-sm mb-6">用一两句话描述专辑的主题、情绪或故事</p>
              <label className="block text-sm text-muted mb-2">专辑主题 / 核心概念 *</label>
              <textarea
                className="textarea-field h-28"
                placeholder="例：关于离开这个概念——不是物理上的移动，而是心理上的断舍离。用 3 首歌讲述一个人从被困住到走出来的过程。"
                value={form.theme}
                onChange={(e) => update('theme', e.target.value)}
              />
              <label className="block text-sm text-muted mt-4 mb-2">补充说明（可选）</label>
              <textarea
                className="textarea-field h-16"
                placeholder="任何你想补充的灵感、情绪方向..."
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </div>
          )}

          {/* Step 1: Tracks & language */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">曲目和语言设置</h2>
              <div className="mb-6">
                <label className="block text-sm text-muted mb-3">曲目数量</label>
                <div className="flex gap-3">
                  {[3, 5, 8, 12].map((n) => (
                    <button
                      key={n}
                      onClick={() => update('trackCount', n)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        form.trackCount === n
                          ? 'bg-accent-orange/10 border border-accent-orange/30 text-accent-orange shadow-glow-sm'
                          : 'bg-white/[0.02] border border-white/[0.05] text-muted-dim hover:text-white hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5'
                      }`}
                    >
                      {n} 首
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-muted mb-3">专辑语言</label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { value: 'chinese', label: '中文' },
                    { value: 'english', label: '英文' },
                    { value: 'bilingual', label: '中英双语' },
                    { value: 'instrumental', label: '纯音乐' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('language', opt.value)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        form.language === opt.value
                          ? 'bg-accent-orange/10 border border-accent-orange/30 text-accent-orange shadow-glow-sm'
                          : 'bg-white/[0.02] border border-white/[0.05] text-muted-dim hover:text-white hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasInstrumental}
                  onChange={(e) => update('hasInstrumental', e.target.checked)}
                  className="rounded bg-surface-border"
                />
                包含纯音乐曲目
              </label>
            </div>
          )}

          {/* Step 2: Style & audience */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">风格和听众</h2>
              <label className="block text-sm text-muted mb-2">参考风格</label>
              <input
                className="input-field mb-6"
                placeholder="例：林俊杰、Coldplay、坂本龙一..."
                value={form.referenceStyle}
                onChange={(e) => update('referenceStyle', e.target.value)}
              />
              <label className="block text-sm text-muted mb-2">目标听众</label>
              <textarea
                className="textarea-field h-20"
                placeholder="谁在听这张专辑？在什么场景下听？..."
                value={form.targetAudience}
                onChange={(e) => update('targetAudience', e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Publish target */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">发布计划</h2>
              <label className="block text-sm text-muted mb-3">目标平台</label>
              <div className="flex gap-3 mb-6">
                {([
                  { value: 'netease', label: '网易云音乐' },
                  { value: 'qq', label: 'QQ 音乐' },
                  { value: 'none', label: '暂不发布' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('publishTarget', opt.value)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      form.publishTarget === opt.value
                        ? 'bg-accent-orange/10 border border-accent-orange/30 text-accent-orange shadow-glow-sm'
                        : 'bg-white/[0.02] border border-white/[0.05] text-muted-dim hover:text-white hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-0.5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <label className="block text-sm text-muted mb-3">需要生成的物料</label>
              <div className="flex flex-col gap-3">
                {[
                  { key: 'generateCover', label: '专辑封面' },
                  { key: 'generateVideo', label: '宣传视频' },
                  { key: 'generateCopy', label: '宣传文案 & 艺人故事' },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[opt.key as keyof typeof form] as boolean}
                      onChange={(e) => update(opt.key, e.target.checked)}
                      className="rounded bg-surface-border"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 className="section-header mb-6">确认创建</h2>
              <div className="card-glow p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                    <span className="text-muted-dim">主题</span>
                    <span className="text-white font-medium max-w-[60%] text-right">{form.theme || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                    <span className="text-muted-dim">曲目数</span>
                    <span className="text-white font-medium">{form.trackCount} 首</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                    <span className="text-muted-dim">语言</span>
                    <span className="text-white font-medium">{form.language}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                    <span className="text-muted-dim">参考风格</span>
                    <span className="text-white font-medium">{form.referenceStyle || '未指定'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-dim">目标平台</span>
                    <span className="text-white font-medium">{form.publishTarget === 'none' ? '暂不发布' : form.publishTarget}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-surface-border">
        <span className="badge-accent">步骤 {step + 1}/{STEPS.length}</span>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost">
              上一步
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !form.theme.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? '创建中...' : '创建项目'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
