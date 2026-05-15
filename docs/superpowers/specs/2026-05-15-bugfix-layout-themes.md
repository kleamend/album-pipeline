# Bug 修复 + 布局重构 + 角色主题

> 目标：修复 10 个 Bug，重构全宽灵活布局，引入 8 套角色灵感主题

---

## 1. MiniMax 状态验证重构

### 当前问题
`check_minimax_status()` 仅验证 CLI 是否登录（`mmx auth status`），不验证真实 API 连通性。

### 修复方案
拆分为三层独立状态，分别返回给前端：

| 层级 | 检查方式 | 状态值 |
|------|----------|--------|
| CLI 安装 | `shutil.which("mmx")` | `installed` / `missing` |
| CLI 认证 | `mmx auth status` | `authenticated` / `not_authenticated` |
| API 连通 | `mmx quota` 真实调用 | `connected` / `unverified` / `error` |

ProviderStatus 组件展示三个独立指示灯，而非单一的"Ready"状态。

---

## 2. Toast 通知系统

### 当前问题
错误只有 `console.error`，用户看不到任何反馈。`catch(() => {})` 静默吞错。

### 修复方案
创建 `Toast` 组件，4 种类型：

| 类型 | 颜色 | 用途 |
|------|------|------|
| `success` | 绿 | 操作成功 |
| `error` | 红 | 操作失败 |
| `warning` | 黄 | 警告 |
| `info` | 蓝 | 一般提示 |

使用方式：`const toast = useToast()` → `toast.error("创建失败：网络错误")`  
自动 4 秒消失，可手动关闭。全局单例，放在 `layout.tsx` 中。

---

## 3. CLI Worker API Key 注入

### 当前问题
MiniMaxMusicWorker 构造时不传入 API Key，无法自动重登录。

### 修复方案
```python
config = load_config()
worker = MiniMaxMusicWorker(api_key=config.get("minimax_api_key") or config.get("llm_api_key"))
```

---

## 4. 隐藏 Bug 修复

### 4a. TypeScript 类型安全
- `TrackStatus` 新增 `"take_selected"` 和 `"transcoded"` 
- 17 处 `any` 替换为具体类型或 `unknown`

### 4b. API Client 统一
- 设置页改用 `api.getConfig()` / `api.updateConfig()` 方法
- TakePlayer 改用 `api.listTakes(albumId)` 方法
- ReleasePanel 改用 `api.listDeliverables(albumId)` 方法
- API client 新增：`getConfig`, `updateConfig`, `listTakes`, `selectTake`, `listDeliverables`
- 所有请求统一走 `request<T>()` 获得超时和错误处理

### 4c. 空安全
- ConceptReview 在访问 `result.results.creative` 前判空
- SongDetail 在访问 `rounds[0]` 前检查数组非空

### 4d. Error Handling
- 6 处 `.catch(() => {})` 改为 toast 通知
- `console.error(e)` 改为 `toast.error(e.message)`

---

## 5. 全宽灵活布局重构

### 当前问题
侧栏 56px 过窄，内容区左侧最多 800px，右侧大片空白。

### 修复方案
C 方案落地：

**侧栏**: 默认宽度 200px，带文字标签和活跃项目列表。底部显示 MiniMax 状态。可折叠为 56px 纯图标模式（按钮在侧栏顶部）。

**内容区**: 根据页面类型自适应——

| 页面类型 | 布局 | 最大宽度 |
|----------|------|----------|
| Dashboard | 三栏全宽（Phase 时间线 / 主内容 / 产物面板） | 无限制 |
| 设置页 | 单栏居中 | max-w-3xl mx-auto |
| 向导/表单 | 单栏居中 | max-w-2xl mx-auto |
| 列表页 | 多列网格全宽 | 无限制 |
| 单曲详情 | 双栏（详情 / 轮次历史） | 无限制 |

**关键 CSS 变更**：
- Sidebar: `w-14` → `w-52`（默认）/ `w-14`（折叠），`transition-all duration-300`
- 设置页: `max-w-2xl` → `max-w-3xl mx-auto`
- Dashboard: `grid-cols-[240px_1fr_240px]` 保持但内容全宽

---

## 6. 8 套角色灵感主题

每套主题包含完整的 CSS 变量定义：背景色、卡片面、边框、主渐变、次按钮、文字色、点缀色、阴影、动画参数。

### 暗色主题（4）

| 主题 | 角色 | 配色 | 纹理 | 图标 | 动效 |
|------|------|------|------|------|------|
| `batman` | 蝙蝠侠 | 炭黑底 #0d1117 + 黄金 #fbbf24 渐变按钮 | SVG 蝙蝠轮廓 pattern | 蝙蝠 Logo | 按钮 glow 黄色脉冲 |
| `joker` | 小丑 | 深紫底 #0d0814 + 霓虹绿 #22c55e 按钮 | 扑克牌花纹 SVG | 鬼牌 Logo | hover 紫→绿渐变流动 |
| `vader` | 达斯维达 | 纯黑底 #09090b + 红光剑 #ef4444 按钮 | 帝国齿轮 pattern | 维达头盔 Logo | 按钮红光呼吸 |
| `mickey` | 米老鼠 | 极黑底 #0a0a0a + 经典红 #ef4444 + 金 #facc15 点缀 | 隐形米奇头 SVG（3圆） | 米奇头 Logo | 红按钮 hover 微弹跳 |

### 亮色主题（4）

| 主题 | 角色 | 配色 | 纹理 | 图标 | 动效 |
|------|------|------|------|------|------|
| `doraemon` | 哆啦A梦 | 天蓝底 #eff6ff + 纯白 #fff 卡片 + 红 #ef4444 点缀 | 铜锣烧圆形 SVG pattern | 铃铛 Logo | 铃铛 hover 晃动 |
| `snoopy` | 史努比 | 奶油白底 #fefce8 + 纯黑 #1e293b 按钮 + 狗屋红 #ef4444 | 狗爪印 SVG pattern | 狗屋 Logo | 卡片 hover 轻弹 |
| `buzz` | 巴斯光年 | 浅绿底 #f0fdf4 + 荧光绿 #84cc16 按钮 + 紫 #a855f7 | 星际网格 SVG | 太空盔 Logo | 按钮 hover 绿荧光扩散 |
| `pikachu` | 皮卡丘 | 暖黄底 #fffbeb + 橙黄 #f59e0b 按钮 + 红 #ef4444 点缀 | 闪电/星星 SVG pattern | 闪电尾 Logo | 按钮 hover 电气闪光 |

### 主题实现架构

```
globals.css 中定义:
  :root[data-theme="batman"] { --color-accent: #fbbf24; ... }
  :root[data-theme="doraemon"] { --color-accent: #3b82f6; ... }
  ...共 8 套

Tailwind config 中:
  colors.accent 引用 var(--color-accent) 而非硬编码 #fb923c

设置页:
  <ThemeSelector /> — 8 张卡片式预览，点击即时切换

layout.tsx:
  读取 localStorage/config 中的 theme 选择 → 设置 data-theme 属性
```

### 暗/亮色覆盖差异

亮色主题额外需要覆盖的 token：
- `--color-surface`: white cards on light background
- `--color-text-primary`: dark text (#1e293b) instead of white
- `--color-border`: lighter borders (#e2e8f0) instead of #1e293b
- `--color-muted`: subtle grays instead of deep grays
- Input backgrounds: white with light border instead of dark with subtle border

---

## 7. 主题切换模式

设置页新增两个 Radio 选项：

| 模式 | 行为 | 存储 |
|------|------|------|
| **随机轮换** | 每次打开 App 从 8 个主题中随机选一个 | `config.json: theme_mode = "random"` |
| **固定主题** | 用户选一个主题后始终用这个 | `config.json: theme_mode = "fixed"` + `theme = "batman"` |

随机模式下仍可手动切主题（临时覆盖），下次打开重新随机。

---

## 8. 执行顺序

| # | 任务 | 优先级 |
|---|------|--------|
| 1 | API client 统一 + 类型安全 + 空安全（Bug 4a-4d, B1-B9） | P0 |
| 2 | MiniMax 状态验证重构（Bug 1） | P0 |
| 3 | Toast 通知系统（Bug 2） | P0 |
| 4 | CLI Worker API Key（Bug 3） | P0 |
| 5 | 全宽灵活布局重构（Bug 5） | P1 |
| 6 | 8 角色主题 CSS 变量 + Tailwind 适配 | P1 |
| 7 | 主题选择器 UI + 切换模式 | P1 |
| 8 | 每个主题的背景纹理 + 角色图标 + 动效 | P1 |
