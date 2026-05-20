# md-wysiwyg Road Map

## 排序原则

功能优先级按以下因素综合排序：

* 是否保护用户内容安全。

* 是否能显著提升 WYSIWYG 写作效率。

* 是否能复用当前 Milkdown / ProseMirror / KaTeX / Mermaid / highlight.js 基础设施。

* 是否为后续复杂功能提供通用入口或底座。

* 实现风险是否适合当前插件阶段。

## v0.2 - 稳定编辑底座

目标：先让用户可以放心地在 **WYSIWYG** 模式中写作、保存、切换。

* [01-content-state-safety.md](01-content-state-safety.md)\
  内容状态安全。完善保存、切换、关闭前的 transient state flush 机制。

* [09-source-switch-continuity.md](09-source-switch-continuity.md)\
  源码切换连续性。优先实现滚动位置恢复和近似光标恢复。

* [06-task-list-interaction.md](06-task-list-interaction.md)\
  任务列表交互。实现 checkbox 点击切换，成本低、体验明显。

* [17-word-count-reading-time.md](17-word-count-reading-time.md)\
  字数统计与阅读时间。作为低风险可见功能补充，优先 status-bar 集成并优雅降级。

## v0.3 - 常用编辑入口

目标：让用户不依赖记忆 Markdown 语法，也能完成常见编辑。

* [02-slash-command.md](02-slash-command.md)\
  Slash Command。作为块级插入入口，服务表格、公式、图表、callout 等后续功能。

* [03-markdown-toolbar.md](03-markdown-toolbar.md)\
  Markdown 工具栏。先做固定工具栏，再评估 Bubble Menu。

* [04-link-editing.md](04-link-editing.md)\
  链接编辑。实现 `Cmd+K` / `Ctrl+K` 和链接浮层。

* [07-code-block-language-selector.md](07-code-block-language-selector.md)\
  代码块语言选择器。完善 highlight.js 和 Mermaid 之间的语言切换体验。

## v0.4 - 复杂 Markdown 块

目标：补齐 WYSIWYG 相比源码编辑最有优势的结构化块。

* [05-table-editing.md](05-table-editing.md)\
  表格编辑增强。插入表格、添加/删除行列、对齐方式。

* [08-image-basic-support.md](08-image-basic-support.md)\
  图片基础支持。先支持本地图片路径、拖拽和粘贴到相对路径。

* [11-math-editing-enhancement.md](11-math-editing-enhancement.md)\
  数学公式编辑增强。完善源码/预览切换和错误提示。

* [10-mermaid-editing-enhancement.md](10-mermaid-editing-enhancement.md)\
  Mermaid 编辑增强。源码/预览切换、模板插入、错误区域和重新渲染。

## v0.5 - 长文档与技术文档增强

目标：让插件更适合 PRD、技术方案、知识库和博客文档。

* [12-outline-heading-navigator.md](12-outline-heading-navigator.md)\
  大纲导航。提供侧边 heading navigator 和跳转。

* [13-front-matter-support.md](13-front-matter-support.md)\
  Front Matter 支持。识别 YAML front matter，作为可折叠源码块编辑。

* [14-callout-admonition.md](14-callout-admonition.md)\
  Callout / Admonition。支持 note、tip、warning 等提示块。

* [15-footnote-editing.md](15-footnote-editing.md)\
  脚注编辑。实现引用和定义之间的可视化跳转。

## 推荐首个开发切片

如果只启动一个小版本，建议 v0.2 按以下顺序实施：

1. 内容状态安全。
2. 任务列表交互。
3. 源码切换连续性。
4. 字数统计与阅读时间。

这一组能先补齐“可靠写作”的核心体验，同时实现风险可控，不会过早引入大型 UI 系统。

## 推荐首个体验型版本

如果目标是快速让用户感知到 WYSIWYG 编辑效率提升，建议 v0.3 作为重点：

1. Slash Command。
2. Markdown 工具栏。
3. 链接编辑。
4. 代码块语言选择器。

这组功能会让插件从“可以渲染和编辑 Markdown”变成“可以舒服地创建 Markdown 结构”。

<br />

<br />

<br />

<br />
