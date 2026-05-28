# supportedLanguages 数组补全

## 功能描述

将 `lib/language-atx-stack.js` 中的 `supportedLanguages` 数组从当前的 9 种语言（缺少 C、C++、Go、Shell）补全为 PRD 定义的 13 种语言，并同步更新 `package.json` 的 description、keywords，以及 `README.md` 的语言列表。

## 为什么做？

当前 `supportedLanguages` 数组仅包含 Java、Kotlin、Python、JavaScript、TypeScript、CSS、HTML、Rust、Dart 9 种语言，与 PRD 定义的 13 种目标不一致。C、C++、Go、Shell 四种语言虽然 Pulsar 已内置 grammar，但仍需在数组中体现本包的覆盖意图。

## 收益

- `show-supported-languages` 命令显示完整的 13 种语言列表
- `package.json` 的 description 和 keywords 准确反映包的覆盖范围
- 为后续 v0.2 的 grammar 接入提供一致的元数据基础

## 基础设施支持情况

- 现有代码：`lib/language-atx-stack.js` 已导出 `supportedLanguages` 数组
- 现有代码：`package.json` 已有 description 和 keywords 字段
- 现有代码：`README.md` 已有语言列表段落
- 暂不需要新增第三方依赖

## 实现要点

- 在 `supportedLanguages` 数组末尾添加 `'C'`、`'C++'`、`'Go'`、`'Shell'`
- 更新 `package.json` 的 `description` 加入 C、C++、Go、Shell
- 更新 `package.json` 的 `keywords` 数组加入 `c`、`cpp`、`go`、`shell`
- 更新 `README.md` 的语言列表段落

## 风险与注意事项

- 仅修改元数据，不影响 Pulsar 的 grammar 加载行为
- 不为已内置语言注册 grammar，避免 scope 冲突
