# html-live-view 技术设计文档

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                       Pulsar Workspace                       │
│                                                             │
│  ┌─────────────────────┐   ┌────────────────────────────┐  │
│  │ HtmlLiveViewPackage │──▶│ HtmlLiveView (View)        │  │
│  │                     │   │                            │  │
│  │ - activate          │   │  ┌──────────────────────┐  │  │
│  │ - deactivate        │   │  │ <iframe              │  │  │
│  │ - toggle            │   │  │  src="file:///tmp/..."│  │  │
│  │ - addOpener         │   │  │  sandbox="allow-scripts│  │  │
│  │ - observeTextEditors│   │  │  allow-forms">       │  │  │
│  └─────────────────────┘   │  │  [Processed HTML]    │  │  │
│                            │  │  [Inlined CSS/JS]    │  │  │
│                            │  │  [Bridge Script]     │  │  │
│                            │  └──────────────────────┘  │  │
│                            │                            │  │
│                            │  ┌──────────────────────┐  │  │
│                            │  │ Bridge Script         │  │  │
│                            │  │ - console 转发        │  │  │
│                            │  │ - 错误捕获            │  │  │
│                            │  │ - 链接拦截            │  │  │
│                            │  │ - alt-h 转发          │  │  │
│                            │  └──────────────────────┘  │  │
│                            │                            │  │
│                            │  ┌──────────────────────┐  │  │
│                            │  │ DevTools Bridge       │  │  │
│                            │  │ - toggleDevTools()    │  │  │
│                            │  └──────────────────────┘  │  │
│                            └────────────────────────────┘  │
│                                                             │
│  自动渲染:                                                   │
│    .html file open ──opener──▶ new HtmlLiveView(filePath)   │
│                                                             │
│  手动切换:                                                   │
│    TextEditor ──Alt+H──▶ new HtmlLiveView(editor)          │
│    HtmlLiveView ──Alt+H──▶ workspace.open(filePath)        │
│                              + destroy live view            │
└─────────────────────────────────────────────────────────────┘
```

打开 `.html` 文件时，`workspace.addOpener` 拦截文件 URI，创建 `HtmlLiveView` 实例。`observeTextEditors` 作为兜底处理已在编辑器中打开的文件。用户按 `Alt+H` 可在源码和渲染视图之间切换。切回源码的文件加入 `_sourceModePaths` 集合，后续不再自动渲染。

## 2. 技术栈

### 2.1 运行时环境

| 环境 | 版本 |
|------|------|
| Pulsar | Electron 25+ |
| Node.js | 随 Electron 内置（18.x+） |

### 2.2 核心渲染

| 技术 | 说明 |
|------|------|
| `<iframe>` | 原生 HTML 元素，作为渲染容器 |
| `sandbox` 属性 | 控制 iframe 的安全权限 |
| `file://` 临时文件 | 写入处理后 HTML 到 `/tmp/html-live-view/`，通过 `src` 加载 |
| `pathToFileURL()` | Node.js URL 模块，生成正确的 file:// URL |
| `postMessage` | iframe 与父窗口的安全通信通道 |

### 2.3 依赖清单

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

零运行时依赖，零构建步骤。所有功能通过原生 DOM API、Pulsar API 和 Electron API 实现。

## 3. 渲染管线

### 3.1 HTML 处理流程

```
原始 HTML (file on disk)
  │
  ├─ 1. inlineLocalAssets(html, baseDir)
  │     读取本地 <link href="style.css"> → 内联为 <style>
  │     读取本地 <script src="app.js"> → 内联为 <script>
  │
  ├─ 2. resolvePaths(processed, baseDir)
  │     剩余相对路径（图片等）→ file:// 绝对 URL
  │
  ├─ 3. bridge script 注入
  │     在 <head> 后插入 IIFE bridge 脚本
  │
  └─ 4. 写入临时文件
        /tmp/html-live-view/<encoded-path>
        iframe.src = pathToFileURL(tmpPath).href
```

### 3.2 为什么用 file:// 而不是 srcdoc

Pulsar 的 CSP 策略为 `script-src 'self' 'unsafe-eval'`。`srcdoc` 会继承父页面 CSP，导致内联脚本被阻止。`file://` 匹配 CSP 的 `self`，允许内联脚本执行。

### 3.3 Sandbox 权限矩阵

| 权限 | 效果 | 默认启用 | 风险等级 |
|------|------|----------|----------|
| `allow-scripts` | 允许 JS 执行 | ✅ | 低（不与 allow-same-origin 同时使用） |
| `allow-forms` | 允许表单提交 | ✅ | 低 |
| `allow-modals` | 允许 alert/confirm/prompt | ❌ | 中 |
| `allow-popups` | 允许 window.open / target="_blank" | ❌ | 中 |
| `allow-same-origin` | **禁止** — 与 allow-scripts 组合会架空沙箱 | 🚫 | 极高 |

### 3.4 通信架构

```
┌─────────────────────────┐       postMessage       ┌──────────────────┐
│  Pulsar Plugin (Parent) │ ◀────────────────────── │  iframe (Child)  │
│                         │                          │                  │
│  - 链接导航拦截          │ ◀─ { type: 'navigate' } ─│  拦截 <a> 点击   │
│  - 控制台消息转发        │ ◀─ { type: 'console' } ──│  console 拦截     │
│  - 错误消息捕获          │ ◀─ { type: 'error' } ───│  onerror 捕获     │
│  - alt-h 转发            │ ◀─ { type: 'toggle' } ──│  keydown 拦截     │
└─────────────────────────┘                          └──────────────────┘
```

Bridge 脚本注入到 iframe `<head>` 后，作为 IIFE 执行：
- 拦截所有 `<a>` 点击，锚点 `#section` → `scrollIntoView`，外部链接 → `postMessage`
- 拦截 `console.log/warn/error/info`，转发到父窗口的 Pulsar 控制台
- 捕获 `window.onerror` + `unhandledrejection`，转发错误信息
- 监听 `Alt+H` 按键，转发 `toggle` 消息到父窗口

## 4. 模块设计

### 4.1 HtmlLiveViewPackage（主模块）

职责：包生命周期管理、命令注册、opener 注册、模式切换。

| 方法 | 说明 |
|------|------|
| `activate(state)` | 注册 opener、observeTextEditors、toggle/refresh/devtools 命令、恢复已打开的渲染视图 |
| `deactivate()` | 销毁所有订阅 |
| `serialize()` | 保存当前打开的渲染视图 URI 列表 |
| `toggle()` | 根据活跃 item 类型自动切换方向 |
| `_switchToLiveView(textEditor, pane)` | 创建 HtmlLiveView，替换 TextEditor |
| `_switchToSource(liveView, pane)` | 记录 source mode，销毁 live view，打开文件 |
| `_maybeOpenAsPreview(editor)` | 兜底：将已在编辑器中的 .html 文件切换为渲染模式 |

### 4.2 HtmlLiveView（核心视图）

职责：管理单个 iframe 渲染实例的完整生命周期。

构造函数（两种模式）：

```
constructor(textEditorOrPath)
  ├─ string (文件路径) → _loadFromDisk() → 直接渲染
  └─ TextEditor → getText() → _renderContent() → 渲染 + fs.watchFile 监听
  ├─ 创建 DOM: element (.html-live-view) > iframe
  ├─ 设置 iframe sandbox 属性（从 config 构建）
  ├─ 注册 postMessage 监听器
  └─ 若 autoReload → _startWatching()
```

Pulsar PaneItem 接口：

| 方法 | 说明 |
|------|------|
| `getTitle()` | 文件名 + " (Preview)" |
| `getLongTitle()` | 文件名 + " (Preview)" |
| `getURI()` | `html-live-view://` + 文件路径 |
| `getPath()` | 文件路径 |
| `getElement()` | 根 DOM 元素 |
| `serialize()` | filePath + deserializer 标识 |
| `isModified()` | 始终返回 false |
| `copy()` | 创建同文件路径的新实例 |
| `destroy()` | 清理 DOM、停止文件监听、移除 postMessage 监听器、删除临时文件 |

### 4.3 Bridge Script

```
lib/bridge-script.js — getBridgeScript() → string
```

导出模板字符串函数，返回注入 iframe 的 IIFE 脚本。使用 `var`/`function()` 语法最大化兼容性。

### 4.4 Path Resolver

```
lib/path-resolver.js — resolvePaths(html, baseDir), resolveUrl(url, baseDir)
```

将 HTML 中的相对路径转为绝对 `file://` URL。使用 Node.js `pathToFileURL()` 构造 URL。跳过 `http(s)://`、`data:`、`#` 锚点等。

### 4.5 DevTools Bridge

```
lib/devtools.js — toggleDevTools()
```

通过 `require('electron').remote.webContents.getAllWebContents()` 获取 iframe 的 WebContents，调用 `openDevTools({mode:'detach'})`。

## 5. 数据流

### 5.1 自动渲染（文件打开）

```
用户打开 .html 文件
  → workspace.addOpener 拦截 file:// URI
  → new HtmlLiveView(filePath)
    → _loadFromDisk() → fs.readFile → _renderContent(html)
```

### 5.2 实时更新

```
外部编辑器保存文件
  → fs.watchFile 检测 mtime 变化
  → _scheduleReload() → 防抖 debounceDelay ms
  → _loadFromDisk() → fs.readFile → _renderContent(html)
```

### 5.3 模式切换（Alt+H）

```
渲染视图 → 源码:
  toggle() → _switchToSource(liveView, pane)
    → _sourceModePaths.add(filePath)
    → pane.destroyItem(liveView)
    → workspace.open(filePath)

源码 → 渲染视图:
  toggle() → _switchToLiveView(textEditor, pane)
    → new HtmlLiveView(textEditor)
    → pane.activateItem(liveView)
    → pane.destroyItem(textEditor)
```

### 5.4 链接点击处理

```
iframe 内用户点击 <a href="...">
  → bridge 脚本拦截 click 事件
  → 锚点 #section → scrollIntoView
  → 外部链接 → postMessage({ type: 'navigate', url })
  → 父窗口 → shell.openExternal(url)
```

## 6. 文件结构

```
html-live-view/
  lib/
    html-live-view.js          # 主模块 + HtmlLiveView 类
    bridge-script.js           # iframe bridge 脚本模板
    path-resolver.js           # 相对路径解析
    devtools.js                # DevTools 集成
  styles/
    html-live-view.less        # 渲染视图容器样式
  keymaps/
    html-live-view.json        # Alt+H toggle, Ctrl+Shift+I devtools
  menus/
    html-live-view.json        # Packages > HTML Live View
  spec/
    html-live-view-spec.js     # 集成测试
    path-resolver-spec.js      # 路径解析单元测试
  package.json
```

## 7. 配置项

| 配置键 | 类型 | 默认值 | 范围 | 说明 |
|--------|------|--------|------|------|
| `debounceDelay` | integer | 300 | 100-3000 | 文件变更后重新渲染的防抖延迟（ms） |
| `autoReload` | boolean | true | - | 文件变更时是否自动更新渲染 |
| `sandboxAllowForms` | boolean | true | - | 是否允许 iframe 内表单提交 |
| `sandboxAllowModals` | boolean | false | - | 是否允许 iframe 内弹窗 |
| `sandboxAllowPopups` | boolean | false | - | 是否允许 iframe 内打开新窗口 |

## 8. 键绑定

| 快捷键 | 命令 | 作用域 | 说明 |
|--------|------|--------|------|
| `Alt+H` | `html-live-view:toggle` | `atom-workspace`, `.html-live-view` | 在源码和渲染视图间切换 |
| `Ctrl+Shift+I` | `html-live-view:devtools` | `.html-live-view` | 打开/关闭 DevTools |

## 9. 性能考量

| 场景 | 策略 |
|------|------|
| 大文件（>5000 行） | 防抖延迟可配置；临时文件写入由 OS 缓冲 |
| 外部资源加载 | inlineLocalAssets 仅在首次渲染时读取磁盘 |
| iframe 重渲染 | file 变更触发完整重渲染；临时文件写入 + src 更新 |
| 多标签页 | 每个 HtmlLiveView 实例持有独立 iframe |
| 内存 | destroy 时清理 iframe（清空 src、移除 DOM、删除临时文件） |
