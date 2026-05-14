'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';

export default function SettingsPage() {
  const [llmKey, setLlmKey] = useState('');
  const [llmBaseUrl, setLlmBaseUrl] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [musicModel, setMusicModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cliStatus, setCliStatus] = useState('检测中...');

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setLlmKey(data.llm_api_key || '');
        setLlmBaseUrl(data.llm_base_url || '');
        setLlmModel(data.llm_model || '');
        setMusicModel(data.music_model || '');
      })
      .catch(() => {});
    fetch('/api/providers/status')
      .then((res) => res.json())
      .then((data) => {
        const labels: Record<string, string> = {
          ready: 'MiniMax CLI 已检测到',
          cli_missing: 'MiniMax CLI 未安装',
          api_key_missing: 'CLI 未登录',
          not_configured: '未配置',
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
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_api_key: llmKey,
          llm_base_url: llmBaseUrl,
          llm_model: llmModel,
          music_model: musicModel,
        }),
      });

      if (!res.ok) throw new Error('保存失败');

      const data = await res.json();
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

        <div className="max-w-2xl space-y-6">
          {/* LLM Configuration */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-2">LLM API 配置</h2>
            <p className="text-xs text-muted-dim mb-6">
              Agent Runtime 调用 LLM 生成歌词、编曲、评分等文字内容。支持任何 OpenAI 兼容接口
              （如 MiniMax API、DeepSeek、OpenAI 等）。
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-dim mb-2">
                  API Key
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="password"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors"
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  value={llmKey}
                  onChange={(e) => setLlmKey(e.target.value)}
                />
                <p className="text-[10px] text-muted-dim mt-1">
                  API Key 仅存储在本机，不会上传到任何服务器。支持 sk- 前缀的密钥。
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2">API Base URL</label>
                <input
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors font-mono"
                  value={llmBaseUrl}
                  onChange={(e) => setLlmBaseUrl(e.target.value)}
                />
                <p className="text-[10px] text-muted-dim mt-1">
                  默认 OpenAI，使用 MiniMax 可填 https://api.minimax.chat/v1
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2">模型名称</label>
                <input
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                />
                <p className="text-[10px] text-muted-dim mt-1">
                  例如 gpt-4o / deepseek-chat / abab7-chat
                </p>
              </div>
            </div>
          </div>

          {/* MiniMax CLI */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-2">MiniMax CLI</h2>
            <p className="text-xs text-muted-dim mb-6">
              MiniMax CLI 用于音乐生成（Phase 4）和图片/视频生成（Phase 6）。
              CLI 有独立的认证体系，在终端运行 <code className="px-1.5 py-0.5 bg-surface rounded text-xs">minimax auth login</code> 完成登录。
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-dim mb-2">CLI 状态</label>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cliStatus.includes('检测到') ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-sm text-muted">{cliStatus}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2">默认音乐模型</label>
                <input
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors"
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-accent-orange hover:bg-accent-orange/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            {saved && <span className="text-sm text-green-400">保存成功</span>}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>

          {/* Workspace */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">工作区</h2>
            <div>
              <label className="block text-xs text-muted-dim mb-2">项目目录</label>
              <div className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-muted font-mono">
                ~/album-workspace/projects/
              </div>
            </div>
          </div>

          {/* Netease */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">网易云音乐</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-sm text-muted">未连接</span>
            </div>
            <p className="text-xs text-muted-dim mt-2">
              连接后可生成更完整的上传清单，并快速进入发布流程。
            </p>
          </div>

          {/* App Info */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">关于</h2>
            <div className="text-xs text-muted-dim space-y-1">
              <p>Album Pipeline v0.1.0</p>
              <p>AI 音乐专辑生产流水线</p>
              <p>Powered by MiniMax CLI</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
