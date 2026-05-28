# DevTools 集成

## 功能描述

为渲染视图提供 Chrome DevTools 集成，支持在编辑器内调试 iframe 中页面的 DOM、网络请求、控制台输出和 JS 执行。

## 为什么做？

HTML 渲染的核心场景之一是调试。没有 DevTools，用户遇到渲染问题或 JS 错误时只能猜测原因或切换到外部浏览器。

## 收益

- 在编辑器内完成完整的 HTML 开发调试循环
- 查看控制台输出、网络请求、DOM 结构
- 断点调试 iframe 内的 JavaScript

## 基础设施支持情况

- 现有依赖：Electron `webContents` API、`remote` 模块
- 现有代码：核心渲染（Feature 01）
- 可能新增代码：`lib/devtools.js`、DevTools toggle 命令
- 暂不需要新增第三方依赖

## 实现要点

- 通过 Electron `remote` 模块获取 iframe 的 `webContents`
- 提供 `html-live-view:devtools` 命令（`Ctrl+Shift+I`）
- 实现状态管理：打开/关闭切换、deactivate 时自动关闭
- 控制台消息通过 bridge 脚本的 `postMessage` 转发到 Pulsar 开发者控制台（`Alt+Cmd+I`）

## 风险与注意事项

- Electron 25 中 iframe 的 webContents API 可能有限制，需验证
- 如果无法获取独立 iframe 的 webContents，降级为使用 `webContents.openDevTools({mode: 'detach'})` 打开全局 DevTools
- DevTools 窗口应在插件 deactivate 或视图销毁时关闭
- `remote` 模块在较新 Electron 版本中可能需要特殊配置
