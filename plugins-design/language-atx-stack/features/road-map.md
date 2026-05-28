# language-atx-stack Road Map

## 排序原则

功能优先级按以下因素综合排序：

* 是否填补 Pulsar 语言高亮缺口
* 是否有成熟、稳定、可引用的 grammar 源
* 是否能通过示例文件快速验证效果
* 是否涉及内置 grammar 冲突风险
* 实现成本是否匹配当前插件阶段

## v0.1 - 插件骨架 ✅

* 插件骨架、activationCommands、show-supported-languages 通知命令
* supportedLanguages 数组（9 语言）
* grammars/ 目录预留

## v0.2 - 缺口语言覆盖

目标：让 Kotlin、Dart、C++ 在 Pulsar 中获得语法高亮，并建立验证体系。

* [01-supported-languages-update.md](01-supported-languages-update.md)\
  supportedLanguages 数组补全。将数组更新为 13 语言，同步 README 和 package.json 元数据。

* [02-kotlin-grammar.md](02-kotlin-grammar.md)\
  Kotlin TextMate Grammar 接入。基于 nishtahir/language-kotlin 填补 Pulsar Kotlin 高亮缺口。

* [03-dart-grammar.md](03-dart-grammar.md)\
  Dart TextMate Grammar 接入。基于 Dart-Code/Dart-Code 填补 Pulsar Dart 高亮缺口。

* [04-cpp-grammar.md](04-cpp-grammar.md)\
  C++ TextMate Grammar 接入。填补 Pulsar C++ 高亮缺口（注意与内置 C grammar 的 scope 隔离）。

* [05-sample-files-verification.md](05-sample-files-verification.md)\
  示例文件与高亮验证体系。为每种接入语言提供示例文件和手动验证流程。

## v0.3+ - 质量增强

* 评估 Pulsar Tree-sitter 成熟度，对 Kotlin/Dart/C++ 考虑从 TextMate 迁移到 Tree-sitter
* 审计已内置 10 种语言的 grammar 质量，对不足之处（嵌入语言高亮、新增语法构造）提供增强
* 添加 CI 自动化验证（Pulsar headless 模式打开 sample 文件并检查 scope）

## Won't Do

| Feature | 原因 |
|---------|------|
| 自定义语法主题 token | 颜色由 Pulsar syntax theme 处理，语言包不耦合主题 |
| LSP / 诊断 / 补全 | 属于独立工具层（如 code-hopper），不在语法高亮包内 |
| 替换内置 grammar | 内置 grammar 质量已足够，替换带来冲突风险，收益不明确 |
| Grammar 在线更新 | 静态 grammar 文件随包发布即可，无需运行时更新机制 |
| Tree-sitter WASM 构建集成 | 工具链复杂度高，留待 Pulsar 原生支持更成熟后评估 |

## 推荐首个开发切片

建议 v0.2 按以下顺序实施：

1. supportedLanguages 数组补全。
2. Kotlin Grammar 接入。
3. Dart Grammar 接入。
4. C++ Grammar 接入。
5. 示例文件与验证体系。

这一组能从"10/13 语言有高亮"提升到"13/13 语言全覆盖"，同时建立可复用的验证基础设施。
