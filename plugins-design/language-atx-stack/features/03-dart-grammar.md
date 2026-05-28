# Dart TextMate Grammar 接入

## 功能描述

将成熟的 Dart TextMate grammar 引入 `grammars/dart.json`，通过 `package.json` 的 `grammars` 数组注册，使 Pulsar 打开 `.dart` 文件时自动应用 `source.dart` scope 语法高亮。

## 为什么做？

Pulsar 不内置 Dart 语言包。Atom 官方的 `atom/language-dart` 已归档。`Dart-Code/Dart-Code` 是 Dart 官方维护的 VS Code 扩展，其 TextMate grammar 覆盖全面（关键字、类型注解、null safety、extension、mixin、records 等），是目前最成熟的 Dart grammar 来源。

## 收益

- 打开 `.dart` 文件自动获得语法高亮（类、函数、字段、注解、泛型、异步等）
- 支持 Dart 3.x 新语法（records、patterns、class modifiers）
- 不再需要单独安装第三方 Dart 语言包
- 与 Pulsar 内置 syntax theme 完全兼容

## 基础设施支持情况

- Grammar 来源：`Dart-Code/Dart-Code`（GitHub，BSD-3-Clause License）
- 原始格式：TextMate（可能为 `.tmLanguage` plist 或 `.json`）
- 转换步骤：若为 plist 格式，需转换为 JSON；若已为 JSON 则直接使用。可使用 `plist-to-json` 等工具或手动转换
- 现有代码：`grammars/` 目录已预留
- 暂不需要新增第三方依赖（转换是一次性操作）

## 实现要点

- 从 `Dart-Code/Dart-Code` 提取 Dart grammar 文件（通常在 `syntaxes/dart.tmLanguage.json` 或类似路径）
- 若为 plist 格式，转换为 JSON（CSON 也可，但 JSON 跨编辑器兼容性更好）
- 验证 grammar 的 `scopeName` 为 `source.dart`，`fileTypes` 包含 `dart`
- 在 `package.json` 的 `"grammars"` 数组中添加 Dart 条目
- 在 `grammars/README.md` 中注明来源和 BSD-3-Clause License

## 风险与注意事项

- Dart-Code 的 grammar 文件可能包含 VS Code 特有的注入规则（`injectTo`、`embeddedLanguages`），需确认与 Pulsar 的 TextMate 引擎兼容，必要时裁剪不兼容的部分
- plist → JSON 转换需确保 UTF-8 编码和特殊字符正确转义
- scopeName `source.dart` 不与任何内置 grammar 冲突
