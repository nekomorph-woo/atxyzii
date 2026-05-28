# Ctags 符号索引

## 功能描述

使用 Universal Ctags 为项目生成多语言符号索引，作为跳转候选的主要来源。

## 为什么做？

Code Hopper 的核心目标是“能跳、够快、候选可选”。`ctags` 可以在不启动 LSP 的情况下提取类、方法、函数、结构体等符号，适合轻量代码导航。

## 收益

- 为多语言项目提供统一的定义候选来源。
- 避免每次跳转都全项目文本搜索。
- 支持 Java、Python、C/C++、JavaScript/TypeScript 等常见语言。
- 为候选排序、workspace symbol 搜索、跳转历史提供基础数据。

## 基础设施支持情况

- 依赖工具：Universal Ctags。
- 可能新增代码：`IndexManager`、tags parser、metadata 管理。
- 可能使用 Pulsar API：`atom.project.getPaths()`、`atom.config`、`atom.notifications`。
- 需要 Node API：`child_process`、`fs`、`path`、`crypto`。

## 实现要点

- 启动后按项目根目录生成独立索引。
- 索引文件存放在插件状态目录，不写入源码仓库。
- 优先使用 ctags 的扩展字段输出，保留 `name`、`path`、`line`、`kind`、`scope`、`signature` 等信息。
- 记录 `metadata.json`：索引时间、文件数、符号数、ctags 版本、exclude 配置 checksum。
- 索引构建过程必须可取消，插件停用时终止子进程。

## 风险与注意事项

- 不同 ctags 版本输出字段可能有差异，需要兼容缺失字段。
- 大仓库不能默认无脑全量扫，应结合 exclude 与 source root。
- tags 可能过期，不能作为唯一真相，需要 `rg` 兜底。

