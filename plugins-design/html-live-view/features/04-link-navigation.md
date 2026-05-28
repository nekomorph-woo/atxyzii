# 链接导航拦截

## 功能描述

拦截 iframe 内的链接点击，将导航请求转发到系统默认浏览器，防止在 iframe 内发生页面导航（导致当前预览内容丢失）。

## 为什么做？

iframe 内点击链接会替换当前页面内容，用户丢失正在预览的 HTML。外部链接应在系统浏览器打开，锚点链接应滚动到对应位置。

## 收益

- 防止 iframe 内意外导航导致预览内容丢失
- 外部链接在系统浏览器正确打开
- 锚点链接（`#section`）在 iframe 内正常滚动

## 基础设施支持情况

- 现有依赖：iframe `postMessage` API、Pulsar `shell.openExternal`
- 现有代码：核心渲染（Feature 01）、bridge 脚本注入
- 暂不需要新增第三方依赖

## 实现要点

- 在注入的 bridge 脚本中拦截 `click` 事件（事件委托在 `document` 上）
- 检测点击目标是否为 `<a>` 或其子元素
- 锚点链接（`href` 以 `#` 开头）：在 iframe 内执行 `scrollIntoView`
- 外部链接（`http://`、`https://`、`mailto:`、`tel:`）：通过 `postMessage` 发送到父窗口
- 父窗口监听 `message` 事件，调用 `shell.openExternal(url)` 打开系统浏览器
- 相对链接：根据配置决定在系统浏览器打开或在 iframe 内导航

## 风险与注意事项

- bridge 脚本需要在用户脚本之前执行（注入到 HTML 头部）
- 事件拦截不应影响页面内的 JS 事件处理
- `window.open()` 调用也需要拦截（除非启用了 `allow-popups`）
