# C++ TextMate Grammar 接入

## 功能描述

将成熟的 C++ TextMate grammar 引入 `grammars/cpp.cson`（或 `.json`），通过 `package.json` 的 `grammars` 数组注册，使 Pulsar 打开 `.cpp` / `.cc` / `.cxx` / `.c++` / `.hpp` / `.hh` / `.hxx` / `.h++` 文件时自动应用 `source.cpp` scope 语法高亮。

## 为什么做？

Pulsar 内置 `language-c` 提供了 C 语言的 grammar（`source.c`），但**不包含 C++ 专属 grammar**（`source.cpp`）。C++ 有大量 C 不支持的语法构造（类、模板、命名空间、lambda、concepts、modules 等），需要独立的 grammar 覆盖。VS Code 的 `ms-vscode.cpptools` 扩展包含成熟的 C++ TextMate grammar，可作为来源。

## 收益

- 打开 `.cpp` / `.hpp` 等文件自动获得 C++ 语法高亮（类、模板、命名空间、lambda 等）
- `.c` 文件继续使用内置 `source.c` grammar，不受影响
- 不再需要单独安装第三方 C++ 语言包
- 与 Pulsar 内置 syntax theme 完全兼容

## 基础设施支持情况

- Grammar 来源：VS Code `ms-vscode.cpptools` 扩展（GitHub，MIT License）
- 原始格式：TextMate .json（`syntaxes/cpp.tmLanguage.json`）
- 转换步骤：从 VS Code 扩展包中提取 `.tmLanguage.json`，验证 scopeName 和 fileTypes 后直接使用
- 现有代码：`grammars/` 目录已预留
- 暂不需要新增第三方依赖

## 实现要点

- 从 `ms-vscode.cpptools` 扩展提取 C++ grammar 文件
- 验证 grammar 的 `scopeName` 为 `source.cpp`
- 声明 `fileTypes`：`cpp`、`cc`、`cxx`、`c++`、`hpp`、`hh`、`hxx`、`h++`
- **`.h` 文件不纳入 C++ grammar 的 fileTypes** — `.h` 在 C/C++ 生态中语义模糊（可能是 C header 也可能是 C++ header），由内置 `source.c` 继续处理。用户可通过 Grammar Selector（`Ctrl+Shift+L`）手动切换
- 在 `package.json` 的 `"grammars"` 数组中添加 C++ 条目
- 在 `grammars/README.md` 中注明来源和 MIT License

## 风险与注意事项

- **`.h` 歧义**：这是最关键的风险。将 `.h` 纳入 C++ grammar 会导致纯 C 项目的 header 被错误匹配。不纳入则 C++ 项目的 `.h` header 需要手动切换 grammar。选择不纳入，优先保护 C 项目的体验
- VS Code 的 C++ grammar 可能包含 VS Code 特有的注入规则，需确认与 Pulsar 兼容
- `source.cpp` 与 `source.c` 通过不同的 `fileTypes` 隔离，不会冲突
- C++ grammar 通常较大（覆盖模板、标准库等），文件大小可能达到 100KB+，但对 Pulsar 加载性能影响可忽略
