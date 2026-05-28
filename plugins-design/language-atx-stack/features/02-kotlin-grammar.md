# Kotlin TextMate Grammar 接入

## 功能描述

将成熟的 Kotlin TextMate grammar 引入 `grammars/kotlin.cson`，通过 `package.json` 的 `grammars` 数组注册，使 Pulsar 打开 `.kt` / `.kts` 文件时自动应用 `source.kotlin` scope 语法高亮。

## 为什么做？

Pulsar 不内置 Kotlin 语言包。现有的第三方 Atom 包（如 `atom-kotlin-language`）缺乏维护，不能保证在 Pulsar 上正常工作。`nishtahir/language-kotlin` 是成熟的 Atom 原生 TextMate grammar（CSON 格式），可直接引用，零转换成本。

## 收益

- 打开 `.kt` 文件自动获得语法高亮（关键字、字符串、注释、函数声明、类定义等）
- 打开 `.kts`（Kotlin Script）文件同样获得高亮
- 不再需要单独安装第三方 Kotlin 语言包
- 与 Pulsar 内置 syntax theme 完全兼容

## 基础设施支持情况

- Grammar 来源：`nishtahir/language-kotlin`（GitHub，MIT License）
- 原始格式：TextMate .cson（Atom 包原生格式，与 Pulsar 兼容）
- 转换步骤：无需转换，直接复制 `.cson` 文件到 `grammars/` 目录
- 现有代码：`grammars/` 目录已预留
- 可能使用 Pulsar API：无（声明式注册，Pulsar grammar 引擎自动加载）

## 实现要点

- 从 `nishtahir/language-kotlin` 获取 `grammars/kotlin.cson`
- 在 grammar 文件头部或 `grammars/README.md` 中注明来源和 MIT License
- 验证 grammar 的 `scopeName` 为 `source.kotlin`，`fileTypes` 包含 `kt` 和 `kts`
- 在 `package.json` 的 `"grammars"` 数组中添加 Kotlin 条目

## 风险与注意事项

- 上游 grammar 可能未覆盖最新 Kotlin 语法特性（如 data class、sealed interface、context receivers），需通过示例文件验证关键构造
- `nishtahir/language-kotlin` 的维护频率需关注；若长期不更新，后续可切换到其他来源（如 VS Code `mathiasfrohlich/Kotlin` 扩展的 grammar）
- scopeName `source.kotlin` 不与任何内置 grammar 冲突
