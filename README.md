# tk-ATx

个人 Pulsar 插件合集。普通用户建议直接从单个插件的 GitHub 源码仓库安装，不需要 clone 整个 `tk-ATx`。

## 插件

| 插件 | 功能描述 |
| --- | --- |
| [md-wysiwyg](https://github.com/nekomorph-woo/md-wysiwyg) | Markdown 所见即所得编辑器，支持 WYSIWYG/源码切换、GFM、表格、任务列表、图片资产、Mermaid、数学公式、搜索替换和大纲导航。 |
| [html-live-view](https://github.com/nekomorph-woo/html-live-view) | HTML 实时预览插件，用于在 Pulsar 中查看 HTML 文件并保留页面内 JS/CSS 交互。 |

## 从 GitHub 安装单个插件

以 `md-wysiwyg` 为例：

```bash
mkdir -p ~/.pulsar/packages
git clone https://github.com/nekomorph-woo/md-wysiwyg.git ~/.pulsar/packages/md-wysiwyg
cd ~/.pulsar/packages/md-wysiwyg
npm install
npm run build
```

然后重启 Pulsar，或在 Pulsar 中执行 `Window: Reload`。

如果要安装其他插件，把仓库地址和目录名替换为对应插件即可：

```bash
mkdir -p ~/.pulsar/packages
git clone https://github.com/nekomorph-woo/<plugin-name>.git ~/.pulsar/packages/<plugin-name>
cd ~/.pulsar/packages/<plugin-name>
npm install
npm run build
```

如果插件没有 `build` 脚本，`npm run build` 可以跳过。

## 更新单个插件

进入已安装插件目录后拉取最新代码，并重新安装依赖和构建：

```bash
cd ~/.pulsar/packages/<plugin-name>
git pull
npm install
npm run build
```

然后重启 Pulsar，或执行 `Window: Reload`。

## 移除单个插件

删除对应插件目录即可：

```bash
rm -rf ~/.pulsar/packages/<plugin-name>
```

然后重启 Pulsar，或执行 `Window: Reload`。
