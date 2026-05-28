# 核心渲染与沙箱隔离

## 功能描述

实现基于 sandboxed iframe 的 HTML 渲染核心，支持完整的 HTML/CSS/JS 渲染，通过 sandbox 属性控制安全权限。

## 为什么做？

这是插件的基石。没有安全可靠的渲染能力，后续所有功能（实时更新、DevTools、路径解析等）都无法成立。

## 收益

- 用户在编辑器内直接看到 HTML 渲染效果并与页面交互
- sandbox 隔离确保页面中的 JS 无法访问编辑器进程
- 为后续功能提供统一的渲染容器

## 基础设施支持情况

- 现有依赖：Pulsar SpacePen / etch 组件 API、Atom PaneItem 接口
- 现有代码：无（新建）
- 暂不需要新增第三方依赖

## 实现要点

- 使用 `<iframe srcdoc>` 注入 HTML 内容
- 默认 `sandbox="allow-scripts"`，不允许 `allow-same-origin`
- 实现基本的 HtmlLiveView 类：构造、渲染、销毁
- 实现 toggle 命令：TextEditor ↔ HtmlLiveView 切换

## 风险与注意事项

- `allow-scripts` + `allow-same-origin` 组合会架空沙箱，必须禁止
- iframe srcdoc 在 opaque origin 下运行，`localStorage` 等不可用
- Electron 25 中 iframe 行为需实际验证
