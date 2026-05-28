# 相对路径解析

## 功能描述

自动将 HTML 中的相对路径引用（CSS、JS、图片、字体等）转换为绝对路径，使 sandboxed iframe 能正确加载外部资源。

## 为什么做？

sandboxed iframe 使用 `srcdoc` 时运行在 opaque origin，相对路径无法解析。如果外部 CSS/JS/图片无法加载，大部分单页面应用都无法正常渲染。

## 收益

- 完整渲染依赖外部资源的 HTML 页面
- 支持常见的项目目录结构（css/、js/、img/、assets/ 等）
- 用户无需修改 HTML 中的路径写法

## 基础设施支持情况

- 现有依赖：Node.js `path` 模块、Pulsar TextEditor `getPath()`
- 现有代码：核心渲染（Feature 01）
- 暂不需要新增第三方依赖

## 实现要点

- 解析 HTML 字符串中的 `href`、`src`、`url()` 属性
- 使用 `path.resolve()` 将相对路径转为绝对路径
- 将绝对路径转为 `file://` 协议 URL
- 处理 CSS 内嵌的 `url()` 引用（`<style>` 标签内和外链 CSS 文件内）
- 已为绝对路径、http(s)://、data: 协议的 URL 跳过处理

## 风险与注意事项

- 字符串解析无法处理动态生成的路径（JS 运行时拼接的 URL）
- CSS 内 `url()` 的嵌套层级可能很深（background 简写等）
- 路径解析不应修改 HTML 语义内容
- `file://` 协议在 sandboxed iframe 中可能受 CORS 限制，需验证
