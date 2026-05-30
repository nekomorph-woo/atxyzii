# tk-ATx

个人 Pulsar 插件合集。每个插件子目录是 Git submodule，对应一个独立 GitHub 仓库，可单独开发验证。

## 项目结构

```
tk-ATx/
  <plugin-name>/          # 每个插件一个 Git submodule
  plugins-design/         # 插件设计文档
    <plugin-name>/        # 对应插件的设计文档（PRD、计划、技术方案等）
  .claude/skills/         # 插件生成 skill
  docs/                   # 开发参考文档
```

插件相关的设计文档（PRD、技术方案、开发计划等）必须放在 `plugins-design/<plugin-name>/` 下，与插件源码目录 `tk-ATx/<plugin-name>/` 同名对应。

克隆项目时使用 `git clone --recurse-submodules <repo-url>`，或克隆后执行 `git submodule update --init --recursive`。

## Submodule 分支规则

* 主仓库中的所有插件 submodule 指针都必须指向各自插件仓库 `main` 分支上的提交。

* 如果任意插件开发发生在功能分支，必须先在该插件仓库创建 PR 并合并到 `main`，再更新主仓库 submodule 指针；不要让主仓库指向任何插件功能分支、临时分支或未合并提交。

* 更新任意插件 submodule 时，先在插件目录执行 `git switch main && git pull --ff-only origin main`，再回到主仓库提交 submodule 指针。

## 插件开发准则

* 使用 ES6 Module 语法（`import`/`export`），语言为 JavaScript

* 主模块导出含 `activate()` / `deactivate()` / `serialize()` 生命周期方法的对象

* 用 `CompositeDisposable` 集中管理所有订阅，`deactivate()` 中统一 `dispose()`

* 始终声明 `activationCommands` 实现惰性激活，不要省略导致启动拖慢

* 依赖包间通信用 Service 系统（`consumedServices` / `providedServices`），不直接 `require()`

* 键绑定用 CSS 选择器控制作用域，注意 `:not([mini])` 排除 mini 编辑器

* 样式使用 Less，`@import "ui-variables"` 引入主题变量

## 开发验证

* 本地开发安装使用：`ln -s /path/to/<plugin-name> ~/.pulsar/packages/<plugin-name>`（不要用 `pulsar -p link --dev`，该命令将 symlink 放到 dev 目录，Pulsar 无法可靠加载）

* `Cmd+Shift+F5`（`window:reload`）热重载插件

* `Alt+Cmd+I` 打开 Chrome DevTools

* `Cmd+Shift+.` 打开 Keybinding Resolver 查看键绑定匹配

* `pulsar --test spec/<plugin-name>-spec.js` 命令行运行测试

## 命名约定

* 插件目录名全小写连字符：`md-wysiwyg`、`linter-my-lang`

* 文件名与插件目录名一致：`lib/<plugin-name>.js`

* JS 中类名用驼峰：`AtomWordCount`

* CSS 类名用连字符：`.atom-word-count`

## 生成新插件

使用 `/create-a-plugin` skill，基于 `reference/my-package/` 骨架初始化独立插件仓库，并在 `tk-ATx` 中添加对应 submodule。
