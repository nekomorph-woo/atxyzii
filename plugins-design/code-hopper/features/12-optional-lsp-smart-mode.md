# 可选 LSP Smart Mode

## 功能描述

在后续版本中提供可选 LSP 模式，当用户需要更精准的定义、引用、实现跳转时接入语言服务器。

## 为什么做？

`ctags + rg` 能覆盖轻量导航的大部分日常需求，但 Java 继承、重载、泛型、Python 动态导入等场景会遇到天然边界。可选 LSP 可以作为增强模式，而不是默认负担。

## 收益

- 保留向精准语义导航升级的空间。
- 复杂项目可选择更强能力。
- 不破坏默认轻量体验。
- 与当前候选模型和列表 UI 复用。

## 基础设施支持情况

- 依赖前置：统一 Candidate model、ToolResolver、状态栏状态模型。
- 可能新增代码：LspProvider、server lifecycle manager。
- 可能接入语言：JDT LS、Pyright、clangd、typescript-language-server。

## 实现要点

- 默认关闭，需要用户显式启用。
- 每个 workspace root 最多启动一个对应 language server。
- LSP ready 前继续使用 ctags/rg。
- LSP 结果转为统一 candidate model，与现有列表合并。
- 状态栏展示 Smart Mode 状态。

## 风险与注意事项

- LSP 生命周期、配置和性能复杂度明显高于 ctags/rg。
- 不应在早期版本引入，避免拖慢插件核心能力落地。
- 需要明确区分 Fast Mode 与 Smart Mode。

