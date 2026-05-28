# code-hopper Road Map

## 外部调研摘要

主流代码导航能力大致分成几层：

- 编辑器通常提供 “Go to Definition / Peek Definition / Go Back” 这类基础导航动作。
- 轻量编辑器和插件常用 ctags 做符号索引，用候选列表解决多结果问题。
- `rg` 一类高速搜索工具常被用作全文搜索、引用搜索和索引不可用时的兜底。
- LSP 提供更精准的语义能力，但需要语言服务器、项目模型和索引生命周期管理，适合作为可选增强而不是默认底座。
- 鼠标组合键跳转、状态栏索引状态、workspace symbol 搜索，是成熟编辑器里比较常见的体验拼图。

参考资料：

- Universal Ctags 支持多语言和 kinds，可作为多语言符号索引底座：https://docs.ctags.io/
- ripgrep 面向大代码库的高速递归搜索，默认尊重 gitignore：https://github.com/BurntSushi/ripgrep
- VS Code 的导航功能覆盖 Go to Definition、Peek Definition、Go Back、Go to Symbol：https://code.visualstudio.com/docs/editing/editingevolved
- Sublime Text 社区 CTags 插件提供跳定义和符号候选思路：https://github.com/SublimeText/CTags

## 排序原则

功能优先级按以下因素综合排序：

- 是否支撑“能跳”的核心承诺
- 是否能在没有 LSP 的情况下快速落地
- 是否能降低候选噪音和用户选择成本
- 是否能复用 ctags/rg/候选列表基础设施
- 是否适合 AI Coding 中“快速阅读和定位代码”的工作流
- 实现风险是否匹配当前插件阶段

## v0.1 - 最小可跳版本

目标：先让插件在真实项目里完成从符号到候选、从候选到文件位置的闭环。

- [01-ctags-symbol-index.md](01-ctags-symbol-index.md)\
  Ctags 符号索引。生成多语言符号索引，作为定义候选主来源。

- [09-tool-detection-degrade.md](09-tool-detection-degrade.md)\
  工具检测与降级。检测 ctags/rg，可解释失败并支持退化模式。

- [02-jump-trigger.md](02-jump-trigger.md)\
  跳转触发入口。实现命令、快捷键、`Alt + 鼠标左键点击`。

- [03-candidate-list-jump.md](03-candidate-list-jump.md)\
  候选列表与跳转。展示候选并打开目标文件位置。

## v0.2 - 可靠可用版本

目标：让插件在索引未完成、索引过期、候选过多时仍然好用。

- [04-rg-fallback-search.md](04-rg-fallback-search.md)\
  Rg 兜底搜索。索引不可用时仍能搜索定义候选。

- [05-candidate-ranking.md](05-candidate-ranking.md)\
  候选排序。按上下文、语言、路径、Git 改动和最近文件排序。

- [07-index-scope-config.md](07-index-scope-config.md)\
  索引范围与排除配置。默认排除构建和依赖目录，并允许用户配置。

- [06-status-bar-refresh.md](06-status-bar-refresh.md)\
  状态栏索引刷新。展示索引状态，支持点击手动刷新。

## v0.3 - 阅读流版本

目标：让用户能顺着代码阅读，不只跳过去，也能回来和继续找。

- [08-jump-history.md](08-jump-history.md)\
  跳转历史与返回。记录来源位置，提供返回命令。

- [10-workspace-symbol-search.md](10-workspace-symbol-search.md)\
  Workspace Symbol 搜索。不依赖当前 token，按名称搜索全项目符号。

- [11-reference-search.md](11-reference-search.md)\
  引用搜索。基于 rg 搜索当前符号的引用位置。

## v0.4 - 多语言体验增强

目标：让 Java/Python/Kotlin/Rust/Shell/HTML/CSS/Go/Dart/C/JS 等语言的候选展示更接近各自习惯。

- 增加 Java package/import 解析，提高类和方法候选排序。
- 增加 Python module/import 解析，提高函数和类候选排序。
- 增加 Kotlin package/import/object 解析，提高类、对象和函数候选排序。
- 增加 Rust module/use/impl 解析，提高函数、类型和 trait 候选排序。
- 增加 Shell function 解析，提高脚本函数候选排序。
- 增加 HTML/CSS id/class 关联解析，提高样式与标记之间的候选排序。
- 增加 Go package/import/receiver 解析，提高函数、方法和类型候选排序。
- 增加 Dart import/class/mixin/extension 解析，提高 Flutter/Dart 项目候选排序。
- 增加 C/C++ header/source 邻近规则。
- 增加 JavaScript/TypeScript export/import 识别。
- 增加语言定制 signature formatter。

## v0.5 - 可选精准模式

目标：在不牺牲默认轻量体验的前提下，为复杂项目提供更精准的语义能力。

- [12-optional-lsp-smart-mode.md](12-optional-lsp-smart-mode.md)\
  可选 LSP Smart Mode。用户显式启用后接入语言服务器，并将 LSP 结果合并到候选模型。

## 推荐首个开发切片

如果只启动一个最小可用版本，建议 v0.1 按以下顺序实施：

1. 工具检测与降级。
2. Ctags 符号索引。
3. 跳转触发入口。
4. 候选列表与跳转。

这一组能先兑现 Code Hopper 的核心承诺：在代码上触发跳转，看到候选，选择后打开目标。

## 推荐首个体验型版本

如果目标是让日常使用明显顺手，建议 v0.2 作为重点：

1. Rg 兜底搜索。
2. 候选排序。
3. 索引范围与排除配置。
4. 状态栏索引刷新。

这一组会把“能跳”提升成“多数时候好跳”，尤其适合 1000 个文件左右的微服务项目。
