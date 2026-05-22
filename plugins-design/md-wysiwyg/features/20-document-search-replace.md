# WYSIWYG 搜索与替换

## 功能描述

在 WYSIWYG 模式中提供文档内搜索、上一个/下一个匹配、大小写/整词选项和安全替换。支持 `Alt+F` 打开搜索，`Alt+R` 打开替换。

## 为什么做？

源码模式可以使用 Pulsar 编辑器原生搜索，但 WYSIWYG 模式目前缺少等价入口。长文档编辑时，用户需要在不切回源码的情况下定位文本和批量修正用词。

## 收益

* 补齐 WYSIWYG 编辑器基础能力。

* 降低长文档维护、校对和术语统一成本。

* 与大纲、TOC、脚注导航形成完整的文档定位能力。

## 基础设施支持情况

* 现有依赖：ProseMirror document tree、selection / transaction / decoration 能力。

* 可能新增代码：搜索面板、match scanner、highlight decoration、replace transaction、快捷键注册。

* 快捷键策略：沿用 WYSIWYG 的 `Alt` 系列，避免覆盖 Pulsar 原生 `Cmd/Ctrl+F` 查找体验。

* 暂不需要新增第三方依赖。

## 实现要点

* 只在文本节点中匹配，避免破坏 Mermaid、Math、front matter 等源码块。

* 用 decoration 高亮全部匹配项，并用当前选区标识 active match。

* 替换操作先支持当前匹配和全部匹配，全部替换前展示命中数量。

* 搜索面板应固定在编辑器视口顶部或右上角，不随正文滚动丢失。

* `Alt+F` / `Alt+R` 只在 WYSIWYG 作用域触发，源码模式继续使用 Pulsar 原生搜索。

* WYSIWYG 与源码模式切换时关闭或同步搜索状态。

## 风险与注意事项

* 替换跨 mark 边界时要避免丢失加粗、链接、inline code 等格式。

* 对代码块、Mermaid、Math 的替换策略需要保守，先定位后再决定是否允许替换。

* 大文档实时扫描需要 debounce。

<br />

<br />
