# 候选排序

## 功能描述

对 ctags 与 rg 生成的候选进行合并、去重、打分和排序，让最可能的目标排在前面。

## 为什么做？

轻量导航的成败不只在“找到候选”，更在“候选是否好选”。同名方法、常见函数名、多语言混合项目都会产生噪音。

## 收益

- 减少用户选择成本。
- 提高直接跳转成功率。
- 让 `rg` 的噪音更可控。
- 为后续语义增强或 LSP Smart Mode 保留统一候选模型。

## 基础设施支持情况

- 可能新增代码：`CandidateRanker`、context extractor、dedupe key。
- 可复用数据：当前文件路径、语言、project root、git modified files、recent files、imports/package。
- 暂不需要新增第三方依赖。

## 实现要点

- 候选模型统一包含 `name`、`kind`、`filePath`、`line`、`column`、`language`、`scope`、`signature`、`source`、`score`。
- 去重 key 优先使用 `filePath:line:name:kind`。
- 当前文件、同目录、同语言、最近打开、Git modified 加权。
- build/generated/vendor/test 目录按语境降权。
- Java 额外解析 package/import，优先 import 命中和同 package。
- Python 额外解析 import/module path，优先同 package。

## 风险与注意事项

- 打分规则不能太复杂，早期应保持可解释。
- 不要把低置信结果直接跳转，宁愿展示列表。
- 需要保留候选 source，方便调试“为什么这个排第一”。

