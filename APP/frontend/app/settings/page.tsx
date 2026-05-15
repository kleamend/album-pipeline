'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { api } from '@/src/api/client';

export default function SettingsPage() {
  const [llmKey, setLlmKey] = useState('');
  const [llmBaseUrl, setLlmBaseUrl] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [musicModel, setMusicModel] = useState('');
  const [maxWorkers, setMaxWorkers] = useState(2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cliStatus, setCliStatus] = useState('检测中...');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    api.getConfig()
      .then((data) => {
        setLlmKey(data.llm_api_key || '');
        setLlmBaseUrl(data.llm_base_url || '');
        setLlmModel(data.llm_model || '');
        setMusicModel(data.music_model || '');
        setMaxWorkers(data.max_workers || 2);
      })
      .catch((e: any) => console.warn('Failed to load data:', e?.message || e));
    api.getProviderStatus()
      .then((data) => {
        const labels: Record<string, string> = {
          ready: 'MiniMax CLI 已就绪',
          cli_missing: 'MiniMax CLI 未安装（pip install minimax）',
          cli_not_authenticated: 'CLI 未登录（运行 minimax auth login）',
          cli_version_unknown: '检测到 mmx 但可能不是 MiniMax CLI',
          api_key_missing: 'API Key 未配置',
          not_configured: 'CLI 未配置',
          error: '检测失败',
        };
        setCliStatus(labels[data.minimax] || data.minimax);
      })
      .catch(() => setCliStatus('检测失败'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const data = await api.updateConfig({
        llm_api_key: llmKey,
        llm_base_url: llmBaseUrl,
        llm_model: llmModel,
        music_model: musicModel,
        max_workers: maxWorkers,
      });

      setLlmKey(data.llm_api_key || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">设置</h1>
        <p className="text-muted-dim text-sm mb-8">管理 LLM API 配置和本地工具链</p>

        <div className="max-w-2xl space-y-8">
          {/* LLM Configuration */}
          <div className="card-glow p-6">
            <h2 className="section-header mb-2">LLM API 配置</h2>
            <p className="text-xs text-muted-dim mb-6 mt-2">
              Agent Runtime 调用 LLM 生成歌词、编曲、评分等文字内容。支持 OpenAI 兼容接口。
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">
                  API Key <span className="text-accent-rose">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="input-field pr-14 font-mono"
                    placeholder="sk-xxxxxxxxxxxxxxxx"
                    value={llmKey}
                    onChange={(e) => setLlmKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[10px] text-muted-dim hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-transparent hover:border-muted-border"
                  >
                    {showKey ? '隐藏' : '显示'}
                  </button>
                </div>
                <p className="text-[10px] text-muted-dim mt-1.5">API Key 仅存储在本机，不会上传到任何服务器。</p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">API Base URL</label>
                <input
                  className="input-field font-mono"
                  placeholder="https://api.openai.com/v1"
                  value={llmBaseUrl}
                  onChange={(e) => setLlmBaseUrl(e.target.value)}
                />
                <p className="text-[10px] text-muted-dim mt-1.5">默认 OpenAI，MiniMax 填 https://api.minimax.chat/v1</p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">模型名称</label>
                <input
                  className="input-field"
                  placeholder="gpt-4o"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                />
                <p className="text-[10px] text-muted-dim mt-1.5">例如 gpt-4o / deepseek-chat / abab7-chat</p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">Agent 并发数</label>
                <input
                  className="input-field w-24"
                  type="number" min={1} max={6}
                  value={maxWorkers}
                  onChange={(e) => setMaxWorkers(Number(e.target.value))}
                />
                <p className="text-[10px] text-muted-dim mt-1.5">
                  同时执行的歌曲数量（Phase 2 并行调度）
                </p>
              </div>
            </div>
          </div>

          {/* MiniMax CLI */}
          <div className="card-glow p-6">
            <h2 className="section-header mb-2">MiniMax CLI</h2>
            <p className="text-xs text-muted-dim mb-6 mt-2">
              CLI 用于音乐/图片/视频生成。在终端运行 <code className="px-1.5 py-0.5 bg-surface-elevated rounded text-xs text-accent-orange">minimax auth login</code> 登录。
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">CLI 状态</label>
                <div className="flex items-center gap-2">
                  {cliStatus.includes('已就绪') || cliStatus.includes('检测到') ? (
                    <span className="badge-success gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-sm" />
                      {cliStatus}
                    </span>
                  ) : (
                    <span className="badge-warning gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
                      {cliStatus}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2 font-medium">默认音乐模型</label>
                <input
                  className="input-field"
                  placeholder="music-01"
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn-primary ${saved ? '!bg-gradient-to-r !from-emerald-500 !to-emerald-400 !shadow-emerald-500/20' : ''}`}
            >
              {saving ? '保存中...' : saved ? '已保存' : '保存配置'}
            </button>
            {error && <span className="text-sm text-red-400 animate-fade-in">{error}</span>}
          </div>

          {/* Workspace */}
          <div className="card-glow p-6">
            <h2 className="section-header mb-4">工作区</h2>
            <div>
              <label className="block text-xs text-muted-dim mb-2 font-medium">项目目录</label>
              <div className="input-field font-mono text-muted cursor-default">
                ~/album-workspace/projects/
              </div>
            </div>
          </div>

          {/* Netease */}
          <div className="card-glow p-6">
            <h2 className="section-header mb-4">网易云音乐</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-warning gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                未连接
              </span>
            </div>
            <p className="text-xs text-muted-dim">连接后可生成更完整的上传清单，并快速进入发布流程。</p>
          </div>

          {/* App Info */}
          <div className="card-glow p-6">
            <h2 className="section-header mb-4">关于</h2>
            <div className="text-xs text-muted-dim space-y-1.5">
              <p className="text-white font-medium">Album Pipeline v0.1.0</p>
              <p>AI 音乐专辑生产流水线</p>
              <p>Powered by MiniMax CLI</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
