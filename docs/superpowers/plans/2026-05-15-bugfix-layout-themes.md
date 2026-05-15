# Bug 修复 + 布局重构 + 角色主题 实现计划

> **For agentic workers:** 使用 subagent-driven-development 逐任务实现。

**Goal:** 修复 10 个 Bug，重构全宽灵活布局，引入 8 套角色灵感主题 + 切换模式

**Architecture:** P0：API client 统一 + 类型/空安全 + Toast + MiniMax 验证；P1：布局重构 + 8 主题 CSS + 切换器

---

## Task 1: API Client 统一 + 类型安全 + 空安全（Bug B1-B9 整体修复）

**Files:**
- Modify: `APP/frontend/src/api/client.ts` — 新增 5 个方法
- Modify: `APP/frontend/src/types/index.ts` — TrackStatus 补充
- Modify: `APP/frontend/app/settings/page.tsx` — 替换裸 fetch 为 api 调用
- Modify: `APP/frontend/app/components/TakePlayer.tsx` — 替换硬编码 fetch
- Modify: `APP/frontend/app/components/ReleasePanel.tsx` — 替换硬编码 fetch
- Modify: `APP/frontend/app/components/ConceptReview.tsx` — 判空保护

- [ ] **Step 1: TrackStatus 类型补充**

```typescript
// types/index.ts
export type TrackStatus = 'planned' | 'round_running' | 'needs_revision' | 'finalized' | 'needs_review' | 'take_selected' | 'transcoded';
```

- [ ] **Step 2: API client 新增方法**

```typescript
// client.ts — 添加到 api 对象中
  // Config
  getConfig: () => request<any>('/config'),
  updateConfig: (data: Record<string, unknown>) => request<any>('/config', { method: 'POST', body: JSON.stringify(data) }),

  // Takes (Phase 5)
  listTakes: (albumId: string) => request<any>(`/albums/${albumId}/takes`),
  selectTake: (albumId: string, trackId: string, version: string) =>
    request<any>(`/albums/${albumId}/takes/select?track_id=${trackId}&version=${version}`, { method: 'POST' }),

  // Deliverables (Phase 6)
  listDeliverables: (albumId: string) => request<any>(`/albums/${albumId}/deliverables`),
```

- [ ] **Step 3: 设置页替换 fetches**

```tsx
// settings/page.tsx — 替换所有 fetch(`${BASE}/api/...`) 为 api 方法调用
// 删除 `const BASE = 'http://localhost:8000';`
// useEffect 中: api.getConfig().then(data => { ... })
// handleSave 中: const res = await api.updateConfig({ llm_api_key: llmKey, ... })
// provider status: api.getProviderStatus().then(data => { ... })
```

- [ ] **Step 4: TakePlayer/ReleasePanel 替换硬编码**

```tsx
// TakePlayer.tsx — useEffect:
api.listTakes(albumId).then(data => setTracks(data.tracks || [])).catch(...)

// ReleasePanel.tsx — useEffect:
api.listDeliverables(albumId).then(data => { /* update state */ }).catch(...)
```

- [ ] **Step 5: ConceptReview 判空保护**

```tsx
// 在访问 result.results.creative 之前:
const creative = result?.results?.creative;
if (!creative) { /* show partial error state */ return; }
// 然后用 creative 替代 result.results.creative
```

- [ ] **Step 6: 6 处 .catch(() => {}) 最小修复**

```tsx
// 替换所有 .catch(() => {}) 为:
.catch((e: any) => console.warn('API call failed:', e.message || e))
```

（后续 Task 3 Toast 系统会进一步升级这些 catch）

- [ ] **Verify:** `cd APP/frontend && npx next build`

- [ ] **Commit:**

```bash
git add APP/frontend/src/api/client.ts APP/frontend/src/types/index.ts APP/frontend/app/settings/page.tsx APP/frontend/app/components/TakePlayer.tsx APP/frontend/app/components/ReleasePanel.tsx APP/frontend/app/components/ConceptReview.tsx
git commit -m "fix: unify API client, fix types, null safety, remove hardcoded fetches"
```

---

## Task 2: MiniMax 状态验证重构

**Files:**
- Modify: `APP/backend/app/services/providers/minimax.py` — 返回三层状态
- Modify: `APP/backend/app/api/providers.py` — 新响应格式
- Modify: `APP/frontend/app/components/ProviderStatus.tsx` — 三层指示灯

- [ ] **Step 1: 后端返回三层状态**

```python
# minimax.py — 返回 dict 而非 single string
def check_minimax_status() -> dict:
    result = {"cli_installed": False, "cli_authenticated": False, "api_connected": False}
    
    cli_path = shutil.which("mmx") or shutil.which("minimax")
    if not cli_path:
        return result
    result["cli_installed"] = True
    
    # Check auth
    auth = subprocess.run([cli_path, "auth", "status"], capture_output=True, text=True, timeout=10)
    if auth.returncode == 0:
        result["cli_authenticated"] = True
    
    # Check API connectivity
    if result["cli_authenticated"]:
        quota = subprocess.run([cli_path, "quota"], capture_output=True, text=True, timeout=15)
        if quota.returncode == 0:
            result["api_connected"] = True
    
    return result

# providers.py — 返回新格式
@router.get("/providers/status")
def get_provider_status():
    from ..config_manager import load_config
    config = load_config()
    minimax = check_minimax_status()
    return {
        "minimax": minimax,
        "llm_key_configured": bool(config.get("llm_api_key")),
        "netease": "not_connected",
    }
```

- [ ] **Step 2: 前端三层指示灯**

ProviderStatus.tsx 改为显示 4 个独立状态：
1. `mmx CLI`: 已安装 ✓ / 未安装 ✗
2. `CLI 认证`: 已登录 ✓ / 未登录 ⚠  
3. `API 连通`: 已验证 ✓ / 未验证 ⚠ / 失败 ✗
4. `LLM Key`: 已配置 ✓ / 未配置 ○

- [ ] **Verify:** `cd APP/backend && curl -s http://localhost:8000/api/providers/status | python3 -m json.tool`

- [ ] **Commit:**

```bash
git add APP/backend/app/services/providers/minimax.py APP/backend/app/api/providers.py APP/frontend/app/components/ProviderStatus.tsx
git commit -m "fix: three-layer MiniMax status with real API connectivity check"
```

---

## Task 3: Toast 通知系统

**Files:**
- Create: `APP/frontend/app/components/Toast.tsx`
- Create: `APP/frontend/src/stores/toastStore.ts`
- Modify: `APP/frontend/app/layout.tsx` — 挂载 Toast 容器

- [ ] **Step 1: Toast Store**

```typescript
// stores/toastStore.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string; type: ToastType; message: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function toast() {
  return {
    success: (msg: string) => useToastStore.getState().addToast('success', msg),
    error: (msg: string) => useToastStore.getState().addToast('error', msg),
    warning: (msg: string) => useToastStore.getState().addToast('warning', msg),
    info: (msg: string) => useToastStore.getState().addToast('info', msg),
  };
}
```

- [ ] **Step 2: Toast 组件**

```tsx
// Toast.tsx — 固定在右上角，堆叠显示，带进度条自动消失
'use client';
import { useToastStore } from '@/src/stores/toastStore';

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} onClick={() => removeToast(t.id)}
          className={`px-4 py-3 rounded-xl border backdrop-blur-sm text-sm cursor-pointer animate-slide-in-right shadow-elevated ${colors[t.type]}`}>
          {t.message}
          <div className="h-0.5 mt-2 rounded-full bg-current/20 overflow-hidden">
            <div className="h-full bg-current/40 rounded-full animate-[shrink_4s_linear]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 挂载到 layout.tsx**

在 layout.tsx body 中添加：`<Toast />`

- [ ] **Step 4: 更新错误处理为 toast**

```tsx
// NewAlbumWizard.tsx — replace console.error(e):
import { toast } from '@/src/stores/toastStore';
// In catch block:
toast().error(e.message || '创建失败');

// All 6 处 .catch(() => {}) 升级为:
.catch((e: any) => toast().warning('数据加载失败: ' + (e.message || '未知错误')))
```

- [ ] **Verify:** `cd APP/frontend && npx next build`

- [ ] **Commit:**

```bash
git add APP/frontend/app/components/Toast.tsx APP/frontend/src/stores/toastStore.ts APP/frontend/app/layout.tsx APP/frontend/app/components/NewAlbumWizard.tsx
git commit -m "feat: add Toast notification system, replace silent catch with user feedback"
```

---

## Task 4: CLI Worker API Key 注入

**Files:**
- Modify: `APP/backend/app/api/workflow_phase4.py` — generate-music 端点传 API Key
- Modify: `APP/backend/app/workers/minimax_music.py` — 无变更（已支持）
- Modify: `APP/backend/app/workers/minimax_image.py` — 同样注入
- Modify: `APP/backend/app/workers/minimax_video.py` — 同样注入

- [ ] **Step 1: Phase 4 generate-music 端点中注入 API Key**

在 `generate_track` 函数内创建 worker 时传入 key：

```python
config = load_config()
api_key = config.get("minimax_api_key") or config.get("llm_api_key")
worker = MiniMaxMusicWorker(api_key=api_key)
```

- [ ] **Commit:**

```bash
git add APP/backend/app/api/workflow_phase4.py
git commit -m "fix: inject API key into MiniMax workers for auto-reauth"
```

---

## Task 5: 全宽灵活布局重构

**Files:**
- Modify: `APP/frontend/app/components/Sidebar.tsx` — 加宽 + 可折叠
- Modify: `APP/frontend/app/settings/page.tsx` — 居中
- Modify: `APP/frontend/app/components/NewAlbumWizard.tsx` — 居中
- Modify: `APP/frontend/app/components/ConceptReview.tsx` — 居中
- Modify: `APP/frontend/app/albums/page.tsx` — 全宽网格

- [ ] **Step 1: Sidebar 加宽**

```tsx
// 展开状态 w-52 (200px), 折叠状态 w-14 (56px)
// 新增 collapsed state + toggle button at top
const [collapsed, setCollapsed] = useState(false);
// 展开时: Logo + 文字标签 + 活跃项目 + MiniMax 状态
// 折叠时: 纯图标模式
// 底部 ProviderStatus 移到侧栏底部固定显示
```

- [ ] **Step 2: 设置页居中**

```tsx
// 移除 max-w-2xl，改为:
<main className="flex-1 overflow-y-auto flex justify-center p-8">
  <div className="w-full max-w-3xl space-y-8">
```

- [ ] **Step 3: 向导/概念页居中**

```tsx
// max-w-2xl → max-w-3xl mx-auto
```

- [ ] **Verify:** `cd APP/frontend && npx next build`

- [ ] **Commit:**

```bash
git add APP/frontend/app/components/Sidebar.tsx APP/frontend/app/settings/page.tsx APP/frontend/app/components/NewAlbumWizard.tsx APP/frontend/app/components/ConceptReview.tsx APP/frontend/app/albums/page.tsx
git commit -m "feat: full-width flexible layout — wider collapsible sidebar, centered content"
```

---

## Task 6: 8 角色主题 CSS + Tailwind 适配

**Files:**
- Modify: `APP/frontend/app/globals.css` — 8 套 `[data-theme="xxx"]` 变量
- Modify: `APP/frontend/tailwind.config.ts` — 引 CSS 变量
- Modify: `APP/frontend/app/layout.tsx` — 读取 theme 设置 data-theme

- [ ] **Step 1: 在 globals.css 加 8 套主题变量**

格式：
```css
:root[data-theme="batman"] {
  --color-accent: #fbbf24;
  --color-accent-secondary: #f59e0b;
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-surface-elevated: #1c2128;
  --color-border: #30363d;
  --color-text: #f8fafc;
  --color-text-muted: #8b949e;
  --color-accent-glow: rgba(251,191,36,0.15);
  --color-success: #3fb950;
  --color-warning: #d2991d;
  --color-error: #f85149;
}
:root[data-theme="joker"] { ... }
/* 共 8 套 */
```

四个亮色主题额外需要：
```css
--color-text: #1e293b;
--color-text-muted: #64748b;
--color-bg: #eff6ff; /* 根据主题变化 */
--color-border: #e2e8f0;
```

- [ ] **Step 2: Tailwind config 引 CSS 变量**

```typescript
colors: {
  accent: {
    DEFAULT: 'var(--color-accent)',
    secondary: 'var(--color-accent-secondary)',
    orange: 'var(--color-accent)',
    pink: 'var(--color-accent-secondary)',
    warm: 'var(--color-accent)',
    rose: '#f43f5e',
    glow: 'var(--color-accent-glow)',
  },
  surface: {
    DEFAULT: 'var(--color-surface)',
    dark: 'var(--color-bg)',
    darker: 'var(--color-bg)',
    light: 'var(--color-surface)',
    elevated: 'var(--color-surface-elevated)',
    hover: 'var(--color-surface-elevated)',
  },
}
```

- [ ] **Step 3: layout.tsx 读 theme 设置**

```tsx
useEffect(() => {
  const savedTheme = localStorage.getItem('album-pipeline-theme') || 'warm-vinyl';
  document.documentElement.setAttribute('data-theme', savedTheme);
}, []);
```

保留 `warm-vinyl` 作为默认兜底主题（CSS 变量值同当前硬编码值）。

- [ ] **Commit:**

```bash
git add APP/frontend/app/globals.css APP/frontend/tailwind.config.ts APP/frontend/app/layout.tsx
git commit -m "feat: 8 character-inspired themes with CSS variables and dark/light support"
```

---

## Task 7: 主题选择器 UI + 切换模式

**Files:**
- Modify: `APP/frontend/app/settings/page.tsx` — 新增主题选择 Region
- Create: `APP/frontend/app/components/ThemeSelector.tsx`
- Modify: `APP/backend/app/services/config_manager.py` — DEFAULT_CONFIG 加 theme

- [ ] **Step 1: 后端配置支持**

```python
DEFAULT_CONFIG = { ..., "theme": "warm-vinyl", "theme_mode": "fixed" }
```

- [ ] **Step 2: ThemeSelector 组件**

8 张预览卡片，2×4 或 1×8 网格。每张卡片：角色名 + 色板 + 选中高亮。两个 Radio：随机轮换 / 固定主题。

- [ ] **Step 3: 切换逻辑**

```tsx
// 固定模式: 点击主题卡片 → 切换 data-theme → 保存到 config
// 随机模式: 每次页面加载从 8 个随机选 → 应用到 data-theme
// 随机模式下仍可手动临时切换
```

- [ ] **Commit:**

```bash
git add APP/frontend/app/components/ThemeSelector.tsx APP/frontend/app/settings/page.tsx APP/backend/app/services/config_manager.py
git commit -m "feat: theme selector UI with random/fixed switch modes"
```

---

## Task 8: 角色纹理 + 图标 + 动效

**Files:**
- Modify: `APP/frontend/app/globals.css` — 每套主题加背景纹理和动画
- Modify: `APP/frontend/app/components/Sidebar.tsx` — Logo 根据主题切换 SVG

- [ ] **Step 1: 每套主题的背景纹理**

在 `[data-theme="xxx"]` 中添加：
```css
/* Batman */
[data-theme="batman"] {
  --bg-texture: url("data:image/svg+xml,...蝙蝠轮廓 pattern...");
}
body[data-theme="batman"]::before {
  background-image: var(--bg-texture);
  opacity: 0.03; /* 极低透明度纹理 */
}
```

为 8 个主题各自设计对应的 SVG pattern。

- [ ] **Step 2: 主题相关 Logo 图标**

Sidebar.tsx 根据 `data-theme` 切换 Logo SVG（通过 CSS `content` 或 React 条件渲染）。

- [ ] **Step 3: 动效细节**

```css
/* Batman — yellow glow pulse */
[data-theme="batman"] .btn-primary { box-shadow: 0 0 20px var(--color-accent-glow); }
/* Doraemon — bell shake on hover */
[data-theme="doraemon"] .card:hover { animation: bellShake 0.5s ease; }
/* Pikachu — electric sparkle */
[data-theme="pikachu"] .btn-primary:active { box-shadow: 0 0 30px rgba(245,158,11,0.4); }
```

- [ ] **Commit:**

```bash
git add APP/frontend/app/globals.css APP/frontend/app/components/Sidebar.tsx
git commit -m "style: character-specific textures, icons, and animations for all 8 themes"
```

---

## 验证清单

- [ ] `npx next build` 通过，无类型错误
- [ ] `pytest tests/ -v` 后端测试通过
- [ ] 设置页可用 API client 正常保存
- [ ] Toast 在创建专辑失败时弹出
- [ ] MiniMax 状态显示三层独立指示灯
- [ ] 侧栏可折叠/展开
- [ ] 8 个主题可切换，即时生效
- [ ] 暗/亮主题文字和边框对比度正确
