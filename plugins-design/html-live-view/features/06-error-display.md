# 错误显示与控制台转发

## 功能描述

捕获 iframe 内的 JavaScript 错误和控制台输出，在 Pulsar 开发者控制台或渲染视图底部面板中显示。

## 为什么做？

sandboxed iframe 内的 `console.log` 和错误信息默认不可见。用户无法看到 JS 执行的调试输出和错误信息，严重影响开发体验。

## 收益

- iframe 内的 `console.log/warn/error` 输出可见
- JS 运行时错误（语法错误、引用错误等）能被及时发现
- 在渲染视图底部提供内嵌控制台面板，无需打开全局 DevTools

## 基础设施支持情况

- 现有依赖：bridge 脚本、`postMessage` API
- 现有代码：核心渲染（Feature 01）、链接导航拦截（Feature 04）
- 暂不需要新增第三方依赖

## 实现要点

- bridge 脚本中覆盖 `console.log/warn/error/info`，通过 `postMessage` 转发到父窗口
- bridge 脚本中监听 `window.onerror` 和 `window.onunhandledrejection`
- 父窗口接收消息后，优先输出到 Pulsar 开发者控制台
- 可选：在渲染视图底部添加内嵌控制台面板（可折叠），显示最近 N 条日志
- 内嵌控制台支持 clear、过滤（log/warn/error）

## 风险与注意事项

- 覆盖 console 方法可能影响页面的正常调试行为
- 大量日志输出需要注意性能和内存
- 内嵌控制台面板不应影响渲染视图的布局空间
