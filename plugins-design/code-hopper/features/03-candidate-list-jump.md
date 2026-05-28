# 候选列表与跳转

## 功能描述

当跳转结果不唯一或置信度不足时，展示候选列表；用户选择后打开对应文件并定位到行列。

## 为什么做？

Code Hopper 不追求完整语义解析。多个候选是常态，优秀的候选展示比“假装精准然后跳错”更符合插件定位。

## 收益

- 让不精准变得可控。
- 用户可以通过路径、作用域、kind、签名快速判断目标。
- 可复用为 workspace symbol、references、git changed files 等列表入口。

## 基础设施支持情况

- 可能新增代码：`CandidateListView`、candidate formatter、open target helper。
- 可能使用 Pulsar API：`atom.workspace.open()`、modal panel、SelectListView 或自定义列表。
- 暂不需要新增第三方依赖。

## 实现要点

- 候选主标题展示作用域：`Class#method(args)`、`module::function(args)`。
- 副标题展示路径、行号、kind、语言。
- 支持键盘上下选择、回车打开、Esc 关闭。
- 支持列表内继续输入过滤。
- 默认最多展示 `maxCandidates` 条，避免 UI 卡顿。
- 打开目标时使用 `initialLine`、`initialColumn`，并记录跳转来源。

## 风险与注意事项

- 候选过多时要先排序再截断，否则列表体验会发散。
- ctags 可能只有搜索 pattern 没有准确行号，需要做解析兼容。
- 签名展示缺失时应降级为 `name(...)`，不要阻塞跳转。

