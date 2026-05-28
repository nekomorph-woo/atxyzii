# language-atx-stack 技术设计文档

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                       Pulsar Workspace                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pulsar Grammar Engine                               │  │
│  │                                                      │  │
│  │  Built-in Grammars (10 languages)                    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ source.java   source.python   source.js         │  │  │
│  │  │ source.ts     source.css      source.html       │  │  │
│  │  │ source.rust   source.c        source.go         │  │  │
│  │  │ source.shell  source.tsx                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                         +                            │  │
│  │  language-atx-stack Grammars (3 gap languages)       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ source.kotlin  ← grammars/kotlin.cson          │  │  │
│  │  │ source.dart    ← grammars/dart.json            │  │  │
│  │  │ source.cpp     ← grammars/cpp.cson             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Verification: grammars/samples/                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  hello.kt · hello.dart · hello.cpp · ...            │  │
│  │  手动验证：Cmd+Alt+Shift+P → Log Cursor Scope        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Pulsar 的 grammar 引擎根据文件扩展名匹配 grammar。当多个包注册相同 scope 时，优先级高的胜出。本包只为缺口语言注册 grammar，因此不存在与内置 grammar 的冲突。

## 2. 技术栈

### 2.1 运行时环境

| 环境 | 版本 |
|------|------|
| Pulsar | v1.106+（Tree-sitter 支持） |
| Node.js | 随 Electron 内置 |

### 2.2 Grammar 格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| TextMate CSON | `.cson` | Pulsar/Atom 首选格式 |
| TextMate JSON | `.json` | 通用，跨编辑器兼容 |
| TextMate plist | `.tmLanguage` | macOS TextMate 原生格式 |
| Tree-sitter | `.wasm` + `.scm` | Pulsar v1.106+ opt-in，v0.2 不使用 |

### 2.3 Grammar 来源

| 语言 | 来源项目 | 格式 | License | 用途 |
|------|----------|------|---------|------|
| Kotlin | `nishtahir/language-kotlin` | TextMate .cson | MIT | 填补 Pulsar Kotlin 缺口 |
| Dart | `Dart-Code/Dart-Code` | TextMate .json | BSD-3 | 填补 Pulsar Dart 缺口 |
| C++ | VS Code `ms-vscode.cpptools` | TextMate .json | MIT | 填补 Pulsar C++ 缺口 |

### 2.4 依赖清单

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

零运行时依赖，零构建步骤。Grammar 文件为静态 JSON/CSON，直接随包发布。

## 3. Grammar 注册机制

### 3.1 package.json 声明

在 `package.json` 中通过 `"grammars"` 数组声明 grammar：

```json
{
  "grammars": [
    {
      "scopeName": "source.kotlin",
      "name": "Kotlin",
      "fileTypes": ["kt", "kts"],
      "path": "./grammars/kotlin.cson"
    },
    {
      "scopeName": "source.dart",
      "name": "Dart",
      "fileTypes": ["dart"],
      "path": "./grammars/dart.json"
    },
    {
      "scopeName": "source.cpp",
      "name": "C++",
      "fileTypes": ["cpp", "cc", "cxx", "c++", "hpp", "hh", "hxx", "h++"],
      "path": "./grammars/cpp.cson"
    }
  ]
}
```

### 3.2 Scope 命名约定

| 类型 | 前缀 | 示例 |
|------|------|------|
| 编程语言 | `source.` | `source.kotlin`, `source.cpp` |
| 标记/文本 | `text.` | `text.html` |

### 3.3 文件匹配流程

```
用户打开文件 (e.g., hello.kt)
  │
  ├─ Pulsar 检查已注册 grammar 的 fileTypes
  │  ├── source.kotlin 匹配 .kt → 使用 Kotlin grammar
  │  └── 未匹配 → 使用默认 text.plain
  │
  ├─ Grammar 引擎加载 grammar 文件
  │  └── 解析 .cson/.json → 构建 TextMate 规则树
  │
  └── 逐行 tokenize → 生成 scope 栈 → syntax theme 着色
```

### 3.4 冲突避免策略

- 不注册 Pulsar 已内置的 scope（`source.java`、`source.python` 等）
- C++ 的 `source.cpp` 与内置 C 的 `source.c` 通过不同的 `fileTypes` 隔离
- `.h` 文件不在 C++ grammar 的 `fileTypes` 中声明，避免与 C grammar 歧义

## 4. Grammar 来源归因

### 4.1 Kotlin

| 项目 | 值 |
|------|-----|
| 来源仓库 | `nishtahir/language-kotlin` |
| 原始格式 | TextMate .cson（Atom 包原生格式） |
| 转换步骤 | 无需转换，直接复制 `.cson` 文件 |
| scopeName | `source.kotlin` |
| fileTypes | `kt`, `kts` |
| License | MIT |

### 4.2 Dart

| 项目 | 值 |
|------|-----|
| 来源仓库 | `Dart-Code/Dart-Code`（VS Code 扩展） |
| 原始格式 | TextMate .json 或 plist `.tmLanguage` |
| 转换步骤 | 若为 plist，需转换为 JSON；若已为 JSON 则直接使用 |
| scopeName | `source.dart` |
| fileTypes | `dart` |
| License | BSD-3-Clause |

### 4.3 C++

| 项目 | 值 |
|------|-----|
| 来源仓库 | VS Code `ms-vscode.cpptools` 扩展 |
| 原始格式 | TextMate .json |
| 转换步骤 | 需从 VS Code 扩展包中提取 `.tmLanguage.json`，验证 scopeName |
| scopeName | `source.cpp` |
| fileTypes | `cpp`, `cc`, `cxx`, `c++`, `hpp`, `hh`, `hxx`, `h++` |
| License | MIT |

> **注意**：`.h` 文件不纳入 C++ grammar 的 `fileTypes`。`.h` 在 C/C++ 生态中语义模糊，由内置 `language-c` 的 `source.c` 继续处理。

## 5. 文件结构

```
language-atx-stack/
  grammars/
    README.md                    # Grammar 来源归因和许可证声明
    kotlin.cson                  # Kotlin TextMate grammar
    dart.json                    # Dart TextMate grammar
    cpp.cson                     # C++ TextMate grammar
    samples/
      hello.kt                   # Kotlin 示例代码
      hello.dart                 # Dart 示例代码
      hello.cpp                  # C++ 示例代码
  lib/
    language-atx-stack.js        # 主模块：包生命周期 + supportedLanguages
  spec/
    language-atx-stack-spec.js   # 测试：数组完整性、生命周期
  keymaps/
    language-atx-stack.json      # Ctrl+Alt+L → show-supported-languages
  menus/
    language-atx-stack.json      # Packages 菜单入口
  styles/
    language-atx-stack.less      # 最小样式（预留）
  package.json                   # 插件清单 + grammars 数组
  CHANGELOG.md
  LICENSE.md
  README.md
```

## 6. 配置项

v0.2 无配置项。Grammar 注册为声明式，由 Pulsar grammar 引擎自动处理，不暴露用户可配置项。

## 7. 键绑定

| 快捷键 | 命令 | 作用域 | 说明 |
|--------|------|--------|------|
| `Ctrl+Alt+L` | `language-atx-stack:show-supported-languages` | `atom-workspace` | 显示支持的语言列表通知 |

无新增键绑定需求。

## 8. 性能考量

| 场景 | 策略 |
|------|------|
| Grammar 加载时间 | TextMate grammar 文件通常 < 100KB，Pulsar 在包激活时一次性加载并缓存 |
| 文件扩展名匹配 | Pulsar 使用扩展名哈希表查找 grammar，O(1) 每次文件打开 |
| 内存占用 | Grammar 规则树由 Pulsar 内部管理，插件无额外内存开销 |
| 与内置 grammar 冲突 | 零风险 — 只注册内置不存在的 scope（Kotlin、Dart、C++） |
| 包体积 | 3 个 grammar 文件预计 < 300KB，对安装包大小影响可忽略 |
