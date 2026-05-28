# Code Hopper 技术设计文档

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                       Pulsar Workspace                       │
│                                                             │
│  ┌──────────────────┐      ┌─────────────────────────────┐  │
│  │ CodeHopperPackage│─────▶│ JumpController              │  │
│  │                  │      │                             │  │
│  │ - activate       │      │  token/context extraction   │  │
│  │ - deactivate     │      │  command + Alt-click entry  │  │
│  │ - serialize      │      │  open target + history      │  │
│  │ - consumeStatusBar      └──────────────┬──────────────┘  │
│  └──────────────────┘                     │                 │
│                                           ▼                 │
│  ┌──────────────────┐      ┌─────────────────────────────┐  │
│  │ StatusBarTile    │◀────▶│ IndexManager                │  │
│  │                  │      │                             │  │
│  │ Ready/Indexing   │      │  ctags build / refresh      │  │
│  │ Dirty/Failed     │      │  metadata / dirty state     │  │
│  └──────────────────┘      └──────────────┬──────────────┘  │
│                                           │                 │
│                                           ▼                 │
│  ┌──────────────────┐      ┌─────────────────────────────┐  │
│  │ SearchProvider   │─────▶│ CandidateRanker             │  │
│  │                  │      │                             │  │
│  │ rg fallback      │      │  merge / dedupe / score     │  │
│  │ definition regex │      │  direct jump threshold      │  │
│  └──────────────────┘      └──────────────┬──────────────┘  │
│                                           │                 │
│                                           ▼                 │
│                            ┌─────────────────────────────┐  │
│                            │ CandidateListView           │  │
│                            │                             │  │
│                            │  keyboard filter/select     │  │
│                            │  open file at line/column   │  │
│                            └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

用户通过命令、快捷键或 `Alt + 鼠标左键点击` 触发跳转。插件提取当前 token 与编辑器上下文，优先查询 ctags 索引；索引不可用时调用 rg 兜底搜索。所有候选进入统一模型后由 `CandidateRanker` 排序。高置信单候选直接跳转，多候选进入 `CandidateListView`。

**关键设计**：ctags 和 rg 只负责生成候选，Code Hopper 自己负责候选模型、排序、展示和跳转体验。

## 2. 技术栈

### 2.1 运行时环境

| 环境 | 版本 |
| --- | --- |
| Pulsar | Electron 25+ |
| Node.js | 随 Electron 内置 |
| JavaScript | ES6 Module |

### 2.2 外部工具

| 工具 | 用途 | 备注 |
| --- | --- | --- |
| Universal Ctags | 多语言符号索引 | 推荐安装版本，支持更多语言和字段 |
| ripgrep (`rg`) | 兜底搜索、引用搜索 | 默认尊重 `.gitignore`，适合快速搜索 |

### 2.3 依赖策略

V1 尽量零运行时 npm 依赖，优先使用 Pulsar API、Node API 和外部命令。

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

后续如果需要更好的模糊搜索体验，可再评估引入轻量 fuzzy match 库。

## 3. 数据模型

### 3.1 Candidate

```js
{
  name: 'method',
  kind: 'method',
  filePath: '/repo/src/main/java/per/lc/impl/DoAction.java',
  line: 42,
  column: 10,
  language: 'Java',
  scope: 'DoAction',
  signature: 'method(String ac, int ag)',
  displayName: 'DoAction#method(String ac, int ag)',
  detail: 'src/main/java/per/lc/impl/DoAction.java:42 · method · Java',
  source: 'ctags',
  score: 86
}
```

### 3.2 JumpContext

```js
{
  token: 'method',
  filePath: '/repo/src/main/java/per/lc/service/ActionService.java',
  projectRoot: '/repo',
  language: 'Java',
  row: 120,
  column: 18,
  packageName: 'per.lc.service',
  imports: ['per.lc.impl.DoAction'],
  isTestFile: false
}
```

### 3.3 IndexMetadata

```js
{
  projectPath: '/repo',
  createdAt: '2026-05-23T00:00:00.000Z',
  refreshedAt: '2026-05-23T00:00:00.000Z',
  ctagsVersion: 'Universal Ctags 6.x',
  indexedFileCount: 1000,
  symbolCount: 18000,
  excludeChecksum: '...',
  state: 'ready'
}
```

## 4. 索引设计

### 4.1 索引位置

索引文件放在插件状态目录，避免污染用户仓库。

```text
<plugin-state-dir>/code-hopper/<project-hash>/tags
<plugin-state-dir>/code-hopper/<project-hash>/metadata.json
```

`project-hash` 使用项目绝对路径计算，避免不同项目重名冲突。

### 4.2 构建时机

- 首次打开项目时后台构建
- 空闲定时检查，默认每 5 分钟，有变化才刷新
- 状态栏按钮手动刷新

### 4.3 ctags 调用

候选命令形态：

```bash
ctags -R --languages=all --fields=+nKSt --extras=+q --exclude=target --exclude=build <source-roots>
```

实际参数需要根据当前 Universal Ctags 版本验证后确定。早期实现应兼容字段缺失，只要能拿到 `name`、`path`、`line`、`kind` 即可工作。

### 4.4 排除规则

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

配置变化后将索引标记为 Dirty，并等待下一次刷新或用户手动刷新。

## 5. 搜索设计

### 5.1 rg 兜底

`rg` 用于三类场景：

- ctags 索引尚未完成
- ctags 无候选或候选过少
- 用户执行引用搜索

基础命令形态：

```bash
rg --line-number --column --no-heading <pattern> <project-root>
```

搜索时应用和 ctags 一致的 excludePatterns，并设置超时与最大结果数。

### 5.2 语言定义模式

Java：

```text
class <Token>
interface <Token>
enum <Token>
<return-type> <Token>(...)
```

Python：

```text
class <Token>
def <Token>(...)
async def <Token>(...)
```

C/C++：

```text
<return-type> <Token>(...)
struct <Token>
class <Token>
```

JavaScript/TypeScript：

```text
function <Token>(...)
class <Token>
const <Token> =
export function <Token>(...)
```

Kotlin：

```text
class <Token>
data class <Token>
sealed class <Token>
object <Token>
fun <Token>(...)
suspend fun <Token>(...)
```

Rust：

```text
fn <Token>(...)
struct <Token>
enum <Token>
trait <Token>
mod <Token>
```

Shell：

```text
<Token>() { ... }
function <Token>() { ... }
```

HTML/CSS：

```text
id="<Token>"
class="<Token>"
.<Token> { ... }
#<Token> { ... }
```

Go：

```text
func <Token>(...)
func (receiver) <Token>(...)
type <Token> struct
type <Token> interface
```

Dart：

```text
class <Token>
enum <Token>
mixin <Token>
extension <Token>
<Token>(...)
```

这些模式只用于候选生成，不承诺语义精确。

## 6. 候选排序

### 6.1 通用排序信号

- 当前文件命中
- 当前目录或相邻目录命中
- 当前项目根目录命中
- 当前语言一致
- 文件扩展名与当前文件一致
- Git modified 文件加权
- 最近打开文件加权
- 候选 kind 更接近当前 token 语境
- 测试目录在非测试文件中降权
- generated/build/vendor 等目录降权或排除

### 6.2 Java 额外信号

- package 路径接近
- import 路径命中
- `ClassName.java` 与类名一致
- `src/main/java` 与 `src/test/java` 按当前文件语境加权

### 6.3 Python 额外信号

- module 路径接近
- import 路径命中
- 同 package 目录优先
- `.venv` / `site-packages` 默认排除或降权

### 6.4 直接跳转阈值

只有在满足以下条件时直接跳转：

- 候选数量为 1，或第一名明显高于第二名
- 候选不是来自低置信 rg 模式
- 候选文件存在且行号有效
- score 大于 `directJumpThreshold`

否则展示候选列表。

## 7. 模块设计

### 7.1 CodeHopperPackage

```
lib/code-hopper.js
```

职责：包生命周期、命令注册、服务接入、模块协调。

| 方法 | 说明 |
| --- | --- |
| `activate(state)` | 初始化配置、工具检测、命令、编辑器监听、索引管理 |
| `deactivate()` | 释放订阅、状态栏 tile、timer、子进程 |
| `serialize()` | 保存必要的跳转历史和索引状态引用 |
| `consumeStatusBar(statusBar)` | 创建状态栏 tile |

### 7.2 JumpController

```
lib/jump-controller.js
```

职责：统一处理命令、快捷键和 Alt-click 触发后的跳转流程。

| 方法 | 说明 |
| --- | --- |
| `jumpFromCursor()` | 从当前光标位置提取 token 并触发跳转 |
| `jumpFromMouseEvent(event, editor)` | 从鼠标点击位置提取 token 并触发跳转 |
| `jumpToToken(token, context)` | 查询候选、排序并决定直接跳转或展示列表 |
| `openCandidate(candidate)` | 打开候选文件并定位到行列 |

### 7.3 IndexManager

```
lib/index-manager.js
```

职责：ctags 构建、刷新调度、dirty 状态、metadata 管理。

| 方法 | 说明 |
| --- | --- |
| `start()` | 启动首次索引和定时检查 |
| `rebuild(options)` | 后台重建 tags |
| `query(token, context)` | 查询 tags 候选 |
| `markDirty(reason)` | 标记索引过期 |
| `dispose()` | 清理 timer 和子进程 |

### 7.4 SearchProvider

```
lib/search-provider.js
```

职责：rg 兜底搜索、引用搜索、定义模式生成。

### 7.5 CandidateRanker

```
lib/candidate-ranker.js
```

职责：候选合并、去重、排序、置信度计算。

### 7.6 CandidateListView

```
lib/candidate-list-view.js
```

职责：候选列表 UI、键盘过滤、确认跳转、取消关闭。

### 7.7 JumpHistory

```
lib/jump-history.js
```

职责：记录跳转来源位置，支持 `code-hopper:jump-back`。

### 7.8 ToolResolver

```
lib/tool-resolver.js
```

职责：检测 `ctags` / `rg` 路径、版本和可用性。

## 8. 状态栏设计

通过 `status-bar` consumed service 创建右侧 tile。

```json
{
  "consumedServices": {
    "status-bar": {
      "versions": {
        "^1.0.0": "consumeStatusBar"
      }
    }
  }
}
```

状态：

```text
Code Hopper: Ready
Code Hopper: Indexing...
Code Hopper: Dirty
Code Hopper: Failed
```

点击 tile 触发手动刷新。tooltip 展示符号数、上次刷新时间、工具状态。

## 9. 触发入口

### 9.1 命令

```text
code-hopper:jump-to-symbol
code-hopper:jump-back
code-hopper:refresh-index
code-hopper:search-symbol
code-hopper:find-references
```

### 9.2 快捷键

默认快捷键在实现前需要检查 Pulsar 冲突。候选：

```text
alt-g alt-d -> code-hopper:jump-to-symbol
alt-g alt-b -> code-hopper:jump-back
```

### 9.3 Alt-click

监听 TextEditorElement 的 `mousedown`：

```js
if (event.altKey && event.button === 0) {
  // screen position -> buffer position -> token -> jump
}
```

需要排除 mini editor，避免影响设置页、搜索框、命令面板等输入场景。

## 10. 失败与降级

### 10.1 索引未完成

跳转时直接使用 `rg` 搜索候选，同时状态栏显示 `Indexing...`。

### 10.2 索引过期

继续使用旧索引生成候选，并混入 `rg` 结果；状态栏显示 `Dirty`。

### 10.3 候选过多

先排序并截断到 `maxCandidates`，允许用户继续在候选列表中输入过滤。

### 10.4 候选不确定

不直接跳转，展示候选列表让用户选择。

### 10.5 工具缺失

状态栏显示 `Failed`，点击后展示缺失工具和配置入口。

## 11. 性能目标

面向 1000 个左右源码文件的普通微服务项目：

- 首次索引目标：3 秒左右完成，允许后台继续运行
- 跳转响应目标：300ms 内展示候选或进入兜底搜索
- 索引刷新：后台执行，不阻塞编辑器输入
- 候选列表：默认最多展示 50 条

对大型仓库不承诺全量索引速度，优先通过 exclude 配置和 source root 识别控制范围。

## 12. 清理与生命周期

`deactivate()` 必须释放：

- `CompositeDisposable`
- 状态栏 tile
- 鼠标事件监听
- 定时刷新 timer
- 运行中的 ctags/rg 子进程
- 候选列表 panel

## 13. 测试策略

### 13.1 单元测试

- token extraction
- ctags output parser
- rg output parser
- candidate merge/dedupe/ranking
- excludePatterns 参数转换

### 13.2 集成测试

- 激活/停用生命周期
- 命令触发跳转
- 候选列表选择后打开文件
- `ctags` 缺失时退化到 `rg`
- 状态栏点击触发刷新

### 13.3 手动验证

- Java 微服务项目，约 1000 个源码文件
- Python 小项目
- C/C++ 含 header/source 的项目
- 混合语言项目
