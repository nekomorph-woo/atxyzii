# language-atx-stack PRD

## 问题陈述

日常开发会频繁在 Java、Kotlin、Python、JavaScript、TypeScript、CSS、HTML、Rust、Dart、C、C++、Go、Shell 之间切换。Pulsar 自带或第三方语法包分散安装、质量不一，个人配置迁移时也不方便统一管理。

经盘点，Pulsar 已内置 10 种目标语言的语法高亮（Java、Python、JavaScript、TypeScript、CSS、HTML、Rust、C、Go、Shell），**缺口仅 3 种：Kotlin、Dart、C++**。现有第三方 Atom/Pulsar 包缺乏维护，且这些语言均有成熟的 TextMate grammar 可直接引用。

## 解决方案

`language-atx-stack` 作为个人常用语言高亮包合集，集中声明 13 种语言的语法高亮入口。对 Pulsar 已内置的语言不做重复注册，仅补齐 Kotlin、Dart、C++ 三个缺口的 TextMate grammar。Grammar 以声明式文件（`.cson` / `.json`）存放在 `grammars/` 目录，通过 `package.json` 的 `grammars` 数组注册，由 Pulsar grammar 引擎加载，无需运行时 JavaScript。

## 用户故事

1. 作为 Kotlin 开发者，我想要在 Pulsar 中打开 `.kt` 文件时自动获得语法高亮，以便阅读和编写 Kotlin 代码
2. 作为 Dart/Flutter 开发者，我想要在 Pulsar 中打开 `.dart` 文件时自动获得语法高亮，以便阅读和编写 Dart 代码
3. 作为 C++ 开发者，我想要在 Pulsar 中打开 `.cpp`/`.hpp` 文件时自动获得语法高亮，以便阅读和编写 C++ 代码
4. 作为跨语言开发者，我想要安装一个插件就能确认所有常用语言都有高亮覆盖，以便简化个人配置管理
5. 作为插件维护者，我想要为每种接入的语言提供示例文件，以便快速验证高亮效果是否正确

## 目标

覆盖 13 种编程语言的语法高亮：

- Java
- Kotlin
- Python
- JavaScript
- TypeScript
- CSS
- HTML
- Rust
- Dart
- C
- C++
- Go
- Shell

## 实现决策

* **Grammar 注册方式：package.json grammars 数组** — 通过 `package.json` 声明 `scopeName`、`name`、`fileTypes`、`path`，由 Pulsar grammar 引擎自动加载。声明式，无运行时开销
* **缺口语言优先 TextMate grammar** — v0.2 使用 TextMate grammar（`.cson` / `.json`）填补 Kotlin、Dart、C++ 缺口。Pulsar v1.106+ 的 Tree-sitter 支持仍为 opt-in，WASM 构建工具链不够成熟，TextMate 是当前最务实的选择
* **不替换内置 grammar** — 对 Pulsar 已内置的 10 种语言不注册重复 grammar，避免 scope 冲突和体验退化。`supportedLanguages` 数组仅反映覆盖意图，不代表实际注册 grammar
* **每语言一 commit** — 每接入一种语言的 grammar 单独提交，保持 review 粒度可控
* **构建策略** — 零运行时依赖，零构建步骤。Grammar 文件为静态 JSON/CSON，直接随包发布

## 模块划分

| 模块 | 文件 | 职责 |
|------|------|------|
| LanguageAtxStack | `lib/language-atx-stack.js` | 包生命周期、`supportedLanguages` 数组、通知命令 |
| Grammar 文件 | `grammars/*.cson` / `grammars/*.json` | 缺口语言（Kotlin、Dart、C++）的 TextMate grammar 定义 |
| 示例文件 | `grammars/samples/*.{kt,dart,cpp,...}` | 每种接入语言的示例代码，用于验证高亮效果 |

## 架构决策

* 只为缺口语言（Kotlin、Dart、C++）注册 grammar，不为已内置语言重复注册
* TextMate grammar 优先于 Tree-sitter（v0.2），Tree-sitter 迁移留待 v0.3+ 评估
* 不编写运行时 JavaScript 处理高亮逻辑 — grammar 文件由 Pulsar 引擎声明式加载
* Grammar 来源选择标准：MIT/BSD 许可、GitHub 活跃维护、已在 Atom/VS Code 生态验证
* 颜色和主题完全交给 Pulsar syntax theme 处理，语言包不耦合配色

## 测试决策

### 好测试的标准

* 验证 `supportedLanguages` 数组包含全部 13 种语言
* 验证 `activate()` / `deactivate()` 生命周期不抛异常
* 验证 `package.json` 的 `grammars` 数组结构正确（scopeName、fileTypes、path）
* 手动验证：打开示例文件，通过 `Cmd+Alt+Shift+P`（Log Cursor Scope）确认 scope name 生效

### 不测试

* Grammar 渲染的像素级快照对比（依赖主题，不可预测）
* 内置语言的高亮质量（不在本包控制范围）

## 初始版本范围

v0.1（已完成）：

- 创建可安装、可激活的 Pulsar 插件骨架
- 预留 `grammars/` 目录，后续逐个语言接入成熟 grammar
- 提供激活命令用于验证插件加载

v0.2（计划中）：

- 补全 `supportedLanguages` 数组为 13 种语言
- 接入 Kotlin、Dart、C++ 的 TextMate grammar
- 为每种接入语言提供示例文件和验证流程

## 后续实现方向

1. 评估 Pulsar Tree-sitter 成熟度，对 Kotlin/Dart/C++ 考虑从 TextMate 迁移到 Tree-sitter
2. 审计已内置 10 种语言的 grammar 质量，对不足之处（如嵌入语言高亮、新增语法构造）提供增强
3. 添加 CI 自动化验证（headless 模式打开示例文件并检查 scope）

## 范围外

| 范围 | 原因 |
|------|------|
| Lint / Format / LSP / 自动补全 | 属于独立工具层，不在语法高亮包内 |
| 替换内置 grammar | 内置 grammar 质量已足够，替换带来冲突风险 |
| 自定义语法主题 token | 颜色由 Pulsar syntax theme 处理 |
| Grammar 在线更新 | 静态 grammar 随包发布，无需运行时更新机制 |
| 构建工具链（Tree-sitter WASM 编译） | v0.2 使用 TextMate，构建复杂度留待 Tree-sitter 阶段评估 |

## 验收标准

- `supportedLanguages` 数组列出全部 13 种语言
- 打开 `.kt` 文件时 Pulsar 应用 `source.kotlin` scope
- 打开 `.dart` 文件时 Pulsar 应用 `source.dart` scope
- 打开 `.cpp` / `.hpp` 文件时 Pulsar 应用 `source.cpp` scope
- 已内置的 10 种语言的高亮体验不退化
- `deactivate()` 正确释放所有订阅

## 补充说明

* Pulsar v1.106+ 的 Tree-sitter 支持基于 `web-tree-sitter`（WASM），目前为 opt-in。当 Pulsar 将 Tree-sitter 设为默认且 WASM 构建工具链成熟后，可考虑迁移
* 引用的上游 grammar 需在 README 或 grammar 文件头部注明来源和许可证
* 设计文档位置：`plugins-design/language-atx-stack/`
