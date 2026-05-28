# 跳转触发入口

## 功能描述

提供多种触发跳转的入口：命令、快捷键、`Alt + 鼠标左键点击`。

## 为什么做？

不同用户有不同的肌肉记忆。命令适合 Command Palette 和测试，快捷键适合键盘流，`Alt + 点击` 则接近常见编辑器里“点击符号跳转”的直觉。

## 收益

- 降低功能使用门槛。
- 让跳转动作足够顺手。
- 为后续 hover、peek、候选浮层保留交互入口。

## 基础设施支持情况

- 现有骨架：`menus/`、`keymaps/`、`lib/code-hopper.js`。
- 可能新增代码：editor mouse listener、token resolver、jump dispatcher。
- 可能使用 Pulsar API：`atom.commands.add`、`atom.workspace.observeTextEditors()`、`TextEditorElement`。

## 实现要点

- 注册命令 `code-hopper:jump-to-symbol`。
- 默认快捷键建议使用不易冲突的组合，例如 `alt-g alt-d`，实际实现前需检查 Pulsar 常见绑定。
- 监听编辑器 DOM 的 `mousedown`，判断 `event.altKey && event.button === 0`。
- 点击触发时根据 screen position 转换为 buffer position，再读取 token。
- 鼠标触发不应影响普通选择、拖拽、多光标等编辑行为。

## 风险与注意事项

- macOS 上 `Alt` 也用于输入特殊字符，触发逻辑只应在鼠标点击时生效。
- 需要避免 mini editor、设置页、非代码编辑器中误触发。
- 鼠标事件监听要在 `deactivate()` 中清理。

