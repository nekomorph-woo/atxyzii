# 跳转历史与返回

## 功能描述

记录跳转前的位置，提供返回上一个位置的命令。

## 为什么做？

代码导航不是单向动作。用户跳到定义后，常常需要回到原调用点继续阅读。没有返回能力，跳转体验会变得割裂。

## 收益

- 支持“看一眼定义，再回来”的高频阅读动作。
- 降低多次跳转后迷路的概率。
- 为后续前进/后退导航栈打基础。

## 基础设施支持情况

- 可能新增代码：`JumpHistory`。
- 可能使用 Pulsar API：`atom.workspace.getActiveTextEditor()`、`atom.workspace.open()`。
- 暂不需要第三方依赖。

## 实现要点

- 每次实际跳转前记录当前 editor filePath、cursor position、scroll position。
- 提供命令 `code-hopper:jump-back`。
- 返回时打开原文件并恢复 cursor position。
- 初版可以只做单步返回，后续再扩展 stack。

## 风险与注意事项

- 未保存的新 buffer 没有 filePath，初版可跳过或仅记录 editor id。
- 文件关闭或删除后返回应优雅失败。
- 需要避免候选列表关闭、失败跳转时错误记录历史。

