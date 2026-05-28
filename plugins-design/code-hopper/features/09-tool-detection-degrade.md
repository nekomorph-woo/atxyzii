# 工具检测与降级

## 功能描述

检测 `ctags` 和 `rg` 是否可用，识别版本，并在工具缺失时进入可解释的降级模式。

## 为什么做？

Code Hopper 依赖外部命令。用户机器上的安装状态不可控，插件必须把“缺工具”变成可理解、可恢复的状态。

## 收益

- 降低首次使用失败率。
- 让用户知道应该安装或配置哪个工具。
- 支持纯 `rg` 模式或纯 tags 模式。
- 为 bug 排查提供版本信息。

## 基础设施支持情况

- 可能新增代码：`ToolResolver`、diagnostics message。
- 可能使用 Node API：`child_process.execFile`。
- 可能使用 Pulsar API：`atom.notifications`、status bar tooltip。

## 实现要点

- 启动时执行 `ctags --version`、`rg --version`。
- 配置中允许自定义 `ctagsPath` 和 `rgPath`。
- `ctags` 不可用时使用 `rg` 兜底。
- `rg` 不可用时使用已有 tags 文件。
- 两者都不可用时状态栏显示 `Failed`，点击展示修复建议。

## 风险与注意事项

- macOS GUI app 环境 PATH 可能和终端不同，需要允许配置绝对路径。
- 不同 ctags 发行版能力不同，应推荐 Universal Ctags。
- 检测不应阻塞激活流程。

