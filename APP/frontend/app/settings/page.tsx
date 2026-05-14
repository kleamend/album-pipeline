import Sidebar from '@/app/components/Sidebar';

export default function SettingsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">设置</h1>
        <p className="text-muted-dim text-sm mb-8">管理 MiniMax 配置、工作区和连接</p>

        <div className="max-w-2xl space-y-6">
          {/* MiniMax Configuration */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">MiniMax 配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-dim mb-2">API Key</label>
                <input
                  type="password"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors"
                  placeholder="mk-••••••••••••••••"
                  readOnly
                />
                <p className="text-[10px] text-muted-dim mt-1">API Key 仅存储在本机，不会上传到任何服务器</p>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2">CLI 状态</label>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm text-muted">MiniMax CLI 已检测到</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-dim mb-2">默认音乐模型</label>
                <input
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm text-white focus:border-accent-orange/40 focus:outline-none transition-colors"
                  value="music-2.6"
                  readOnly
                />
              </div>
            </div>
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

          {/* Netease Connection */}
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
