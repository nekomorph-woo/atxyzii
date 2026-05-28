# Code Hopper PRD

## 问题陈述

在使用 Claude Code 等 CLI 工具进行 AI Coding 时，用户的主要工作流往往不在完整 IDE 中。代码修改、构建、测试、Git 操作大多发生在终端里，但阅读代码时仍然需要快速完成几类动作：

- 跳到类、方法、函数、结构体等符号定义
- 在多个候选定义之间快速选择
- 看到候选所在文件路径、作用域和大致签名
- 打开文件并定位到对应行列
- 在无需启动重型 IDE 的情况下浏览项目代码

Pulsar 本身具备轻量编辑体验，但缺少面向多语言项目的快速符号跳转能力。完整 LSP 方案虽然更精准，但首次启动、索引、语言服务器配置都更重；对于“能跳、够快、候选可选”的 AI Coding 辅助场景，成本偏高。

## 解决方案

开发 `code-hopper` 插件，为 Pulsar 提供轻量多语言代码导航能力。

插件使用 `ctags` 构建多语言符号索引，使用 `rg` 作为实时搜索和索引不可用时的兜底。用户在代码符号上触发跳转命令后，插件收集候选、排序并展示选择列表；如果只有一个高置信候选，可以直接跳转。

**产品定位**：Code Hopper 不是 IDE，也不是完整语义引擎，而是一个轻量的“候选式代码跳转器”。它接受不完全精准，但要做到快、可理解、可选择。

## 目标用户

1. 作为 AI Coding 用户，我想在终端驱动开发时用 Pulsar 快速查看代码上下文，而不必每次打开 IDEA、PyCharm 等重型 IDE
2. 作为 Java/Python/C 等多语言项目维护者，我想对常见符号进行快速跳转，即使存在多个候选也能通过列表选择
3. 作为代码阅读者，我想看到 `src/main/java/per/lc/impl/DoAction#method(String ac, int ag)` 这类带作用域的信息，以便快速判断目标是否正确
4. 作为轻量编辑器用户，我想手动刷新索引或让插件后台定时刷新，而不是被持续的实时索引拖慢编辑器

## 核心体验

用户在编辑器中把光标放在一个符号上，执行 `code-hopper:jump-to-symbol`，或按住 `Alt` 后用鼠标左键点击符号：

1. 插件读取当前 token 和编辑器上下文
2. 优先查询 `ctags` 索引
3. 索引缺失、过期或无结果时使用 `rg` 搜索候选
4. 合并候选并按当前文件、当前目录、语言、最近文件、Git 改动等信号排序
5. 候选唯一且置信度高时直接打开目标
6. 多候选或低置信度时展示选择列表
7. 用户选择后，插件打开文件并跳到对应行列

候选列表展示建议：

```text
DoAction#method(String ac, int ag)
src/main/java/per/lc/impl/DoAction.java:42 · method · Java

actions.py::DoAction.method(ac, ag)
src/services/actions.py:18 · method · Python

action.c::do_action(const char *ac, int ag)
src/native/action.c:77 · function · C
```

## 核心功能

### 符号跳转

- 从当前光标位置提取 token
- 支持命令触发 `code-hopper:jump-to-symbol`
- 支持快捷键触发跳转
- 支持 `Alt + 鼠标左键点击` 触发跳转
- 基于 `ctags` 查询类、方法、函数等定义候选
- 基于 `rg` 兜底搜索定义形态
- 展示候选选择列表
- 打开候选文件并定位到行列
- 提供跳转返回能力（记录最近跳转来源位置）

### 多语言支持

V1 不为每门语言手写 parser，而是依赖 Universal Ctags 的语言识别能力。

优先验证语言：

- Java
- Python
- Kotlin
- Rust
- Shell
- HTML/CSS
- Go
- Dart
- C/C++
- JavaScript/TypeScript

第一版候选展示可以使用统一格式：

```text
file:line · kind · name
```

对 Java 和 Python 提供更友好的作用域展示：

```text
Java:   src/main/java/a/b/Foo.java#bar(String x)
Python: src/foo.py::Foo.bar(x)
```

### 索引刷新

构建时机限定为三类：

- 首次打开项目时后台构建
- 空闲定时检查，默认每 5 分钟，有变化才刷新
- 状态栏按钮手动刷新

状态栏展示索引状态：

```text
Code Hopper: Ready
Code Hopper: Indexing...
Code Hopper: Dirty
Code Hopper: Failed
```

点击状态栏按钮执行手动刷新，用户不需要打开命令面板。

### 配置项

提供 Pulsar Settings 配置：

- `ctagsPath`：`ctags` 可执行文件路径，默认 `ctags`
- `rgPath`：`rg` 可执行文件路径，默认 `rg`
- `refreshIntervalMinutes`：后台检查间隔，默认 5
- `excludePatterns`：索引与搜索排除目录
- `directJumpThreshold`：直接跳转置信度阈值
- `maxCandidates`：候选列表最大展示数量

默认排除：

```text
.git
.gradle
.idea
.settings
target
build
out
dist
coverage
node_modules
vendor
.venv
venv
__pycache__
generated
gen
```

## 性能目标

面向 1000 个左右源码文件的普通微服务项目：

- 首次索引目标：3 秒左右完成，允许后台继续运行
- 跳转响应目标：300ms 内展示候选或进入兜底搜索
- 索引刷新：后台执行，不阻塞编辑器输入
- 候选列表：默认最多展示 50 条

对大型仓库不承诺全量索引速度，优先通过 exclude 配置和 source root 识别控制范围。

## 失败与降级

### 索引未完成

跳转时直接使用 `rg` 搜索候选，同时状态栏显示 `Indexing...`。

### 索引过期

继续使用旧索引生成候选，并混入 `rg` 结果；状态栏显示 `Dirty`。

### 候选过多

先排序并截断到 `maxCandidates`，允许用户继续在候选列表中输入过滤。

### 候选不确定

不直接跳转，展示候选列表让用户选择。

### 工具缺失

状态栏显示 `Failed`，点击后展示缺失工具和配置入口。

## V1 范围外

- LSP/JDT LS/Pyright 集成
- 精确语义解析、继承链解析、泛型推导、classpath 分析
- 重构能力，如 rename、extract method、move class
- 诊断、补全、hover 文档
- 依赖 jar 或 site-packages 的完整跳转
- 每次输入实时重建索引
- 作为 IDE 替代品

## 验收标准

- 在 Java 项目中能从类名跳到对应 `.java` 文件
- 在 Java 项目中能对常见方法名展示候选列表
- 在 Python 项目中能跳到函数或类定义
- 多候选时展示文件路径、行号、kind、签名或作用域信息
- 状态栏能显示索引状态，并支持点击刷新索引
- exclude 配置生效，默认不索引常见构建目录和依赖目录
- `ctags` 不可用时，插件仍能用 `rg` 提供基础候选
- `deactivate()` 能释放订阅、定时器、状态栏 tile 和子进程

## 后续方向

- 增加 git changed files 面板
- 增加 source root 自动识别
- 增加 workspace symbol 搜索
- 增加引用搜索
- 增加按语言定制的签名提取
- 增加可选 LSP Smart Mode
