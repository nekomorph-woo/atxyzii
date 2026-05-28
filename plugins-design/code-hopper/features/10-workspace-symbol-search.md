# Workspace Symbol 搜索

## 功能描述

提供项目级符号搜索入口，让用户不依赖当前光标 token，也能按名称搜索类、函数、方法等符号。

## 为什么做？

主流编辑器通常同时提供“从当前位置跳定义”和“全项目符号搜索”。AI Coding 场景里，用户经常只知道一个类名或方法名，需要直接打开目标。

## 收益

- 快速打开任意符号定义。
- 复用 ctags 索引和候选列表 UI。
- 比全文搜索更聚焦，噪音更少。
- 适合查找 Java 类、Python 函数、C symbol。

## 基础设施支持情况

- 依赖前置：ctags 索引、CandidateListView。
- 可能新增代码：symbol query provider、kind filter。
- 可能使用 Pulsar API：命令注册、modal panel。

## 实现要点

- 注册命令 `code-hopper:search-symbol`。
- 打开候选列表时聚焦输入框，按用户输入过滤 tags。
- 支持按 kind 过滤：class/function/method/field。
- 支持模糊匹配和路径过滤。
- 选择后复用普通跳转打开逻辑。

## 风险与注意事项

- 大索引直接全量渲染会卡，应分页或限制初始展示。
- 模糊匹配算法先用简单 contains/prefix，后续再优化。
- ctags 数据缺失 signature 时不要影响搜索。

