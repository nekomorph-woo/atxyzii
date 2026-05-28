# 原生 HTML 块与行内标签兼容

## 功能描述

支持 Markdown 中常见原生 HTML 片段在 WYSIWYG 模式下的安全展示、选择、复制和编辑。首要场景是 `<details>` / `<summary>` disclosure 块，例如：

```html
<details>
<summary>agent: code-reviewer</summary>
</details>
```

当前这类内容可能被浏览器按原生 HTML 控件渲染，导致自动折叠、无法像普通文本一样鼠标划选，或在 contenteditable 边界中变得难以修改。v0.7 应把这类 HTML 从“浏览器默认渲染”收回到插件可控的编辑模型中。

## 为什么做？

真实 Markdown 文档经常混用少量 HTML：

- Agent 配置、提示词模板和技术文档会用 `<details>` / `<summary>` 收纳说明或元信息。
- README 和文档常用 `<kbd>` 表示快捷键。
- `<mark>`、`<sub>`、`<sup>`、`<small>` 等行内标签常用于补充 Markdown 原生语法不足。
- `<div>`、`<span>`、`<iframe>`、`<video>`、HTML table 等复杂片段如果直接执行或直接渲染，容易破坏编辑体验和安全边界。

如果 WYSIWYG 模式完全依赖浏览器原生渲染，用户会遇到“看得到但选不中”、“自动折叠导致像丢内容”、“只能切源码才敢改”等问题。

## 收益

- 让包含常见 HTML 片段的 Markdown 文档在 WYSIWYG 中更稳定。
- 让 `summary`、`kbd`、`mark` 等文本可以像普通内容一样选择、复制和编辑。
- 避免复杂 HTML 或嵌入内容破坏编辑器安全边界。
- 为后续更完整的 HTML block / inline mark 支持打基础。

## 支持范围

### v0.7 强支持

这些标签应尽量提供接近普通文本的 WYSIWYG 体验：

| 标签 | 目标行为 |
| --- | --- |
| `<details>` / `<summary>` | 自定义 disclosure block；默认内容可见或有明确占位；`summary` 可选择、复制、编辑；支持源码/预览切换。 |
| `<kbd>` | 渲染为键帽样式，内部文本可选择和编辑。 |
| `<mark>` | 渲染为高亮文本，内部文本可选择和编辑。 |
| `<sub>` / `<sup>` | 渲染为上下标，内部文本可选择和编辑。 |
| `<u>` | 渲染为下划线，内部文本可选择和编辑。 |
| `<small>` | 渲染为小号辅助文本，内部文本可选择和编辑。 |
| `<br>` | 作为 hard break 处理。 |
| `<hr>` | 作为分割线处理，兼容 HTML 写法。 |

### v0.7 安全占位 + 源码编辑

这些标签先不强行 WYSIWYG 化，优先保证可见、可编辑源码、不执行危险内容：

| 标签 | 目标行为 |
| --- | --- |
| `<div>` / 复杂 `<span>` | 作为 HTML 源码块或安全占位展示，保留源码编辑入口。 |
| `<iframe>` | 不直接执行；展示安全占位和源码。 |
| `<video>` / `<audio>` | 不自动播放；展示安全占位和源码。 |
| HTML `<table>` | 首版不和 Markdown table 混合编辑，保守作为源码块处理。 |
| `<pre>` / `<code>` | 可复用 code block 体验；无法安全转换时退回源码块。 |

### 复用已有能力

| 标签 | 目标行为 |
| --- | --- |
| HTML `<img>` | 尽量复用当前图片预览和路径解析能力，但保留 HTML 原文可编辑。 |

## 基础设施支持情况

- 现有依赖：Milkdown / ProseMirror HTML node、当前 source expansion 思路、code block / Mermaid / Math 的源码与预览切换经验。
- 可能新增代码：
  - HTML block / inline HTML 识别与分类。
  - `details` / `summary` 专用 NodeView。
  - 常见 inline HTML mark 的解析、渲染和序列化策略。
  - 复杂 HTML 的安全占位组件。
  - 源码模式与预览模式切换按钮。
  - 鼠标选择、复制、键盘编辑事件隔离。
- 暂不需要新增第三方依赖；如果后续需要更可靠的 HTML 解析，再评估轻量 parser。

## 实现要点

- 首版优先保护内容：无法安全结构化解析的 HTML 必须完整保留源码。
- `details` / `summary` 默认不要直接使用浏览器原生折叠控件作为编辑表面，避免默认折叠和不可选中。
- `summary` 文本需要使用普通可选择文本或可控 input/textarea 承载。
- 对 inline HTML 标签，优先表现为 ProseMirror mark 或可编辑 inline node，而不是不可编辑 DOM。
- 对复杂 block HTML，展示安全占位、标签名、简短摘要和 `Source` 入口。
- 不执行 `<script>`，不自动加载 iframe，`allowUnsafeRendering` 不应扩大 HTML 执行范围。
- WYSIWYG / 源码模式切换后，HTML 原文不丢失、不被无意义重排。

## 验收项

- `<details><summary>agent: code-reviewer</summary></details>` 在 WYSIWYG 中可见且不会因默认折叠导致不可编辑。
- `agent: code-reviewer` 可以用鼠标拖拽选中、复制、替换。
- `<kbd>Alt</kbd>`、`<mark>important</mark>`、`<sub>2</sub>`、`<sup>2</sup>` 可正常显示且文本可选中。
- 复杂 `<iframe>` / `<div>` / HTML table 显示为安全占位或源码块，不直接执行危险内容。
- 可以切换到源码模式编辑完整 HTML，再切回预览。
- WYSIWYG / 源码模式来回切换后 Markdown 内容不丢失、不被意外格式化。

## 风险与注意事项

- Markdown AST 中 HTML 可能只是 raw string，不一定天然结构化，需要保守解析。
- 跨行属性、HTML 实体、非法闭合、嵌套 HTML 都可能导致解析失败，失败时应回退为源码块。
- 行内 HTML 和 Markdown mark 混排时，替换与序列化容易破坏格式，需要重点测试。
- 鼠标选择问题可能来自浏览器原生控件、contenteditable 边界或 NodeView stopEvent，需要单独验证。
