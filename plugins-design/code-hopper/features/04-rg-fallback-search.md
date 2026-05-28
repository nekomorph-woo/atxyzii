# Rg 兜底搜索

## 功能描述

在索引缺失、过期、无结果或工具降级时，使用 `rg` 搜索定义形态并生成候选。

## 为什么做？

`ctags` 需要构建索引，也可能过期。`rg` 无需索引、启动快、尊重 `.gitignore`，适合作为“马上有结果”的兜底层。

## 收益

- 首次索引未完成时仍可跳转。
- ctags 查不到时提供补充候选。
- 工具缺失时可退化为纯搜索模式。
- 对临时文件、小项目、轻量场景更友好。

## 基础设施支持情况

- 依赖工具：ripgrep。
- 可能新增代码：`SearchProvider`、语言定义模式、rg output parser。
- 可能使用 Node API：`child_process`。

## 实现要点

- 使用 `rg --line-number --column --no-heading` 生成候选。
- 默认继承 excludePatterns，避免搜索依赖和构建目录。
- 为常见语言提供定义正则模板。
- Java 模式优先匹配 `class`、`interface`、`enum`、方法定义。
- Python 模式优先匹配 `class`、`def`、`async def`。
- 结果需要和 ctags 候选合并去重。

## 风险与注意事项

- 正则匹配会有误报，需要排序和候选列表消化噪音。
- 搜索大仓库时应设置超时和最大结果数。
- 未保存 buffer 不在 rg 结果中，后续可增加当前 buffer 扫描补偿。

