# 状态栏索引刷新

## 功能描述

在 Pulsar 状态栏展示 Code Hopper 索引状态，并提供点击刷新索引的按钮。

## 为什么做？

用户不想记命令，也不想被索引过程打断。状态栏按钮能把索引状态和手动刷新入口放在一个安静但可见的位置。

## 收益

- 用户能知道当前索引是否 ready。
- 手动刷新不依赖 Command Palette。
- 索引失败时有明确入口查看原因。
- 和“首次打开、空闲定时、手动刷新”三种构建时机匹配。

## 基础设施支持情况

- 需要 consumed service：`status-bar`。
- 可能新增代码：status tile view、index state event emitter。
- 可能使用 Pulsar API：`consumeStatusBar(statusBar)`、`CompositeDisposable`。

## 实现要点

- `package.json` 声明 `consumedServices.status-bar`。
- 状态展示：`Ready`、`Indexing...`、`Dirty`、`Failed`。
- 点击状态栏按钮触发 `IndexManager.rebuild({ reason: 'manual' })`。
- hover tooltip 展示符号数、索引时间、工具状态。
- 索引中禁止重复启动构建，可提供 cancel 或忽略重复点击。

## 风险与注意事项

- 状态栏文字要短，避免挤压其他插件。
- tile、listener、timer 必须在 `deactivate()` 中释放。
- 失败状态要可恢复，用户修好配置后能再次刷新。

