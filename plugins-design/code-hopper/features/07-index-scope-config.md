# 索引范围与排除配置

## 功能描述

提供默认排除目录和用户自定义 excludePatterns，并尽量识别 source root 来缩小索引范围。

## 为什么做？

ctags 性能通常可控，但前提是不扫构建产物、依赖目录和生成代码。多语言项目里这类目录更多，必须从第一版就管住范围。

## 收益

- 缩短首次索引时间。
- 降低候选噪音。
- 避免 tags 文件过大。
- 让用户能适配公司项目结构。

## 基础设施支持情况

- 可能新增配置：`excludePatterns`、`sourceRoots`、`refreshIntervalMinutes`。
- 可能新增代码：config normalizer、source root detector。
- 可能使用 Pulsar API：`atom.config.observe()`。

## 实现要点

- 默认排除 `.git`、`target`、`build`、`out`、`node_modules`、`.venv`、`generated` 等目录。
- Java 优先识别 `src/main/java`、`src/test/java`。
- Python 优先识别包含 `pyproject.toml`、`setup.py`、`requirements.txt` 的项目根。
- 用户未配置 source root 时，可以先扫项目根但应用强排除。
- 配置变更后将索引标记为 Dirty，并等待下次刷新。

## 风险与注意事项

- 排除规则过强可能漏掉用户代码，需要允许用户覆盖。
- 不同工具的 glob 语义不同，ctags 和 rg 参数转换要统一。
- source root 自动识别不能阻止用户手动跳到 root 外文件。

