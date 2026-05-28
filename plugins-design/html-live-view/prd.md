## 问题陈述

Pulsar 编辑器打开 `.html` 文件时只能查看和编辑源码，无法在编辑器内渲染和交互。用户开发单页面 HTML 应用（包含内联 JS/CSS 的独立 HTML 文件）时，需要频繁切换到外部浏览器才能验证效果，打断开发流程。

现有的 `atom-html-preview` 包提供了基础 HTML 预览，但已归档停止维护，使用过时的 CoffeeScript + SpacePen，不支持安全配置、多文件联动、DevTools 集成等现代功能。

## 解决方案

开发 `html-live-view` 插件，为 Pulsar 提供编辑器内嵌的 HTML 渲染和交互环境。打开 `.html` 文件时自动进入渲染模式，按 `Alt+H` 可切换回源码编辑。渲染结果支持完整的 JS 执行和 CSS 样式。

**交互模式**：打开 `.html` 文件默认以渲染模式展示（通过 `workspace.addOpener` 拦截）。用户按 `Alt+H` 在源码和渲染视图之间切换。用户主动切回源码的文件会被记录，后续重新打开时保持源码模式，不会再次自动渲染。渲染视图使用 sandboxed iframe 隔离执行环境，保障编辑器安全。

## 用户故事

1. 作为前端开发者，我想要在编辑器内直接看到 HTML 文件的渲染效果并与之交互（点击按钮、填写表单），以便快速验证单页面应用
2. 作为单页面应用开发者，我想要渲染视图中 JavaScript 能够正常执行，以便测试交互逻辑
3. 作为学习者，我想要保存 HTML/CSS/JS 后实时看到渲染结果更新，以便理解代码效果
4. 作为开发者，我想要通过快捷键（`Alt+H`）在源码和渲染视图之间切换，以便随时检查和修改代码
5. 作为开发者，我想要打开 DevTools 调试渲染视图中的页面，以便排查渲染和交互问题
6. 作为安全意识较强的用户，我想要控制 iframe 的 sandbox 权限级别，以便根据信任度选择安全策略
7. 作为开发者，我想要打开 .html 文件时自动进入渲染模式，以便直接看到页面效果
8. 作为开发者，我想要渲染视图中相对路径的外部资源（CSS、JS、图片）能正确加载，以便渲染完整的页面效果

## 命名方案

| 排名 | 名称 | 说明 |
|------|------|------|
| 1 | `html-live-view` | "live" 强调实时渲染与交互，"view" 对应 md-wysiwyg 的编辑视角，语义清晰 |
| 2 | `html-sandbox` | 强调安全沙箱隔离，突出与普通预览的差异，但可能暗示"不信任用户内容" |
| 3 | `html-renderer` | 直白表达功能，但过于通用，缺少交互含义 |
| 4 | `html-browser` | 强调浏览器级别的渲染能力，但可能暗示完整浏览器功能（标签页、地址栏等） |
| 5 | `live-html` | 简洁，遵循 VS Code "Live Server" 命名风格，但 "live-html" 可能被误解为 "活跃的 HTML" |

**推荐**：`html-live-view` — 与 `md-wysiwyg` 命名风格一致（功能描述式），语义明确，不与其他同类插件重名。

## 实现决策

* **核心架构：自动渲染 + 手动切换** — 通过 `workspace.addOpener` 拦截 `.html` 文件打开，默认以渲染模式展示。`observeTextEditors` 作为兜底处理已在编辑器中打开的文件。用户按 `Alt+H` 切换回源码时，文件被加入 source mode 列表，后续不再自动渲染

* **渲染引擎：sandboxed iframe + file:// 临时文件** — 将处理后的 HTML 写入临时文件，通过 `<iframe src="file://...">` 渲染。`file://` 匹配 Pulsar CSP 的 `self`，允许内联脚本执行（`srcdoc` 会继承父 CSP 导致脚本被阻止）。通过 `sandbox` 属性控制权限

* **外部资源处理** — `inlineLocalAssets()` 读取本地 CSS/JS 文件并内联到 HTML 中，绕过所有 file:// 跨域和 CSP 限制。`path-resolver.js` 将剩余相对路径（图片等）转为 `file://` 绝对 URL

* **实时更新** — 通过 `fs.watchFile` 监听文件变更，防抖后重新从磁盘读取并渲染。不依赖 `textEditor.onDidChange`（因为切换到渲染模式后 TextEditor 已销毁）

* **安全模型** — 默认 `sandbox="allow-scripts allow-forms"`，可配置添加 `allow-modals`、`allow-popups`。禁止 `allow-same-origin`（与 `allow-scripts` 组合会架空沙箱）

* **构建策略** — 主入口 `lib/html-live-view.js` 为手写 CJS，运行时直接操作 DOM。无需打包，零运行时依赖

### 模块划分

| 模块 | 文件 | 职责 |
|------|------|------|
| **HtmlLiveViewPackage** | `lib/html-live-view.js`（下半部分） | 包生命周期、命令注册、opener 注册、toggle 逻辑 |
| **HtmlLiveView** | `lib/html-live-view.js`（上半部分） | 核心渲染视图，管理 iframe 的创建/销毁/内容更新、文件监听 |
| **Bridge Script** | `lib/bridge-script.js` | 注入 iframe 的 IIFE：控制台转发、错误捕获、链接拦截、alt-h 转发 |
| **Path Resolver** | `lib/path-resolver.js` | 相对路径转绝对 URL |
| **DevTools Bridge** | `lib/devtools.js` | DevTools 集成，通过 `remote.webContents` 获取 iframe WebContents |

### 架构决策

* iframe 作为唯一的渲染方式，不引入 `<webview>` 或 `WebContentsView`

* 使用 `file://` 临时文件而非 `srcdoc`（CSP 兼容性）

* 使用 `inlineLocalAssets()` 内联本地 CSS/JS 而非自定义协议

* 不实现 HTTP 服务器模式（Live Server），专注于编辑器内嵌渲染

* `.html` 文件默认渲染模式，用户切回源码后保持源码模式

* 链接点击默认在系统浏览器打开，不在 iframe 内导航

## 测试决策

### 好测试的标准

* 测试插件外部行为：toggle 命令是否正确切换、iframe 是否正确渲染内容、配置项是否生效
* 不测试 iframe 内部渲染结果（依赖 Chromium 行为，不可预测）

### 需要测试的模块

| 模块 | 测试重点 |
|------|----------|
| HtmlLiveViewPackage | 激活/停用生命周期、toggle 命令、opener 拦截 |
| HtmlLiveView | iframe 创建/销毁、内容更新、sandbox 属性设置、序列化恢复 |
| Path Resolver | URL 解析规则覆盖（绝对路径、相对路径、协议跳过） |
| DevTools Bridge | DevTools 打开/关闭状态管理 |

## 范围外

以下功能经评估后决定不实现，浏览器/OS 已有同等或更优的工具：

* 内嵌控制台面板（DevTools 已覆盖）
* Sandbox 可视化预设配置（configSchema toggle 已够用）
* 多文件感知 / 外部 CSS/JS watch（inlineLocalAssets 已内联）
* 状态保留优化（滚动位置/表单值）（file:// 方案下收益有限）
* 响应式视口模拟（浏览器 DevTools 设备模拟更优）
* 网络请求拦截 / Mock（Mock Service Worker 等专业工具更优）
* Snippet 注入（直接改 HTML 或 DevTools Snippets 即可）
* 截图导出（OS 截图工具已足够）
* HTTP 服务器 / Live Server 模式
* 浏览器兼容性测试
* CSS/JS 自动补全或智能提示
* HTML 模板引擎集成
* 协作编辑（Teletype 兼容）

## 补充说明

* **渲染隔离**：iframe 内容运行在独立 origin（因 sandbox），无法访问 `localStorage` 等持久化存储
* **性能考虑**：大文件（>5000 行）或包含大量外部资源的 HTML 页面渲染性能需验证，必要时增加防抖延迟
* **兼容性**：仅在 Pulsar（Electron 25+）上测试
* **设计文档位置**：`plugins-design/html-live-view/`
