# html-live-view Road Map

## v0.1 - 核心渲染 ✅

* [01-core-rendering-sandbox.md](01-core-rendering-sandbox.md) — iframe 沙箱渲染、toggle 命令、auto-render
* [02-live-reload.md](02-live-reload.md) — 文件变更监听、防抖重渲染
* [04-link-navigation.md](04-link-navigation.md) — 链接拦截、外部链接系统浏览器打开

## v0.2 - 开发体验 ✅

* [03-relative-path-resolver.md](03-relative-path-resolver.md) — 相对路径解析 + inlineLocalAssets 内联
* [05-devtools-integration.md](05-devtools-integration.md) — Chrome DevTools 集成
* [06-error-display.md](06-error-display.md) — 控制台转发、错误捕获

## v0.3+ — Won't Do

以下功能经评估后决定不实现，理由：浏览器/OS 已有同等或更优的工具，在编辑器内重复实现投入产出比低。

| Feature | 原因 |
|---------|------|
| 08 Sandbox Config | configSchema 已提供 toggle，可视化预设增量价值低 |
| 09 Console Panel | DevTools 已覆盖，bridge 也已转发到 Pulsar 控制台 |
| 10 Multi-file Awareness | inlineLocalAssets 已内联 CSS/JS，外部文件变化不影响渲染 |
| 11 State Preservation | file:// 方案下实现难度高、收益有限 |
| 12 Viewport Simulation | 浏览器 DevTools 设备模拟是标准方案 |
| 13 Network Interception | 复杂度高，Mock Service Worker 等专业工具更优 |
| 14 Snippet Injection | 直接改 HTML 或用 DevTools Snippets 即可 |
| 15 Screenshot Export | OS 截图工具已足够 |
