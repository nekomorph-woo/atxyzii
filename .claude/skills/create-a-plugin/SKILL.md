---
name: create-a-plugin
description: 创建新的 Atom/Pulsar 插件独立仓库，并把它作为 tk-ATx 的 Git submodule 引入。Use when 用户要求创建新插件、生成插件项目、初始化 Atom/Pulsar 包，或提到 "create plugin" / "新建插件" / "生成骨架"。
---

# 创建 Atom/Pulsar 插件独立仓库

根据用户意图生成推荐插件名，确认后基于骨架模板创建独立 GitHub 仓库，并在 `tk-ATx` 中添加同名 submodule。

## 执行流程

### 1. 生成推荐插件名

根据用户描述生成 2-3 个推荐名称，使用 `AskUserQuestion` 确认。

命名规范：
- 全小写连字符：`atom-word-count`、`language-xyz`、`linter-my-lang`
- 前缀按类型选：`atom-`（通用）/ `language-`（语法）/ `theme-`（主题）/ `linter-`（lint）/ `ui-`（界面）

### 2. 初始化独立插件仓库

基于 [reference/my-package/](reference/my-package/) 模板，在临时目录或目标插件仓库目录初始化 `<PLUGIN_NAME>/`。

替换规则：

| 占位符 | 替换为 | 示例 |
|--------|--------|------|
| `my-package` | 插件名（全小写连字符） | `atom-word-count` |
| `MyPackage` | 驼峰形式 | `AtomWordCount` |
| `<OWNER>` | GitHub owner 或组织名 | `nekomorph-woo` |
| `A short description of your package` | 根据意图生成的描述 | — |

文件重命名：所有 `my-package*` 文件名替换为 `<PLUGIN_NAME>*`。

重要：
- 用 `cp -r` 复制后做替换，不修改 `reference/` 下的模板
- `my-package`、`MyPackage` 和 `<OWNER>` 的所有出现都要替换（注释、CSS 类名、命令名、`package.json.repository`）
- `package.json.repository` 必须指向插件独立源码仓库：`https://github.com/<OWNER>/<PLUGIN_NAME>`，不要指向 `tk-ATx`
- 完成后用 `find` 展示目录结构确认

### 3. 创建 GitHub 仓库

插件必须是独立仓库，默认创建在当前 GitHub owner 下：

```bash
gh repo create <OWNER>/<PLUGIN_NAME> --public --description "<DESCRIPTION>"
```

初始化插件仓库：

```bash
cd <PLUGIN_NAME>
git init
git branch -M main
git add .
git commit -m "Initial <PLUGIN_NAME> plugin scaffold"
git remote add origin https://github.com/<OWNER>/<PLUGIN_NAME>.git
git push -u origin main
```

如果用户要求 private 仓库，使用 `--private`。

### 4. 在 tk-ATx 中添加 submodule

回到 `tk-ATx` 根目录后执行：

```bash
git submodule add -b main https://github.com/<OWNER>/<PLUGIN_NAME>.git <PLUGIN_NAME>
git submodule update --init --recursive <PLUGIN_NAME>
```

这会创建或更新 `.gitmodules`，并让 `tk-ATx/<PLUGIN_NAME>` 指向独立仓库的固定 commit。

### 5. 创建设计文档目录

在主仓库中创建：

```text
plugins-design/<PLUGIN_NAME>/
```

至少放入一个初始设计文档，例如 `prd.md` 或 `notes.md`。设计文档属于 `tk-ATx` 主仓库，不放进插件独立仓库。

### 6. 更新使用说明

如果需要更新主仓库 README，提醒用户使用：

```bash
git clone --recurse-submodules https://github.com/<OWNER>/tk-ATx.git
```

已普通 clone 的用户使用：

```bash
git submodule update --init --recursive
```
