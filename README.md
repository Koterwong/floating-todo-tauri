# Floating Todo Tauri

一个基于 **Tauri v2** + **Vue 3** 开发的轻量级、置顶悬浮待办事项应用。具有极简的毛玻璃 UI 设计和实用的边缘吸附功能。

![App Screenshot](https://raw.githubusercontent.com/tauri-apps/tauri/dev/.github/app-screenshot.png) <!-- 占位图，建议用户替换为实际截图 -->

## 1. 项目介绍

本项目旨在提供一个高效、无干扰的桌面清单工具。其核心特性包括：

- **悬浮置顶**: 窗口始终保持在其他窗口之上，方便随时查看和记录。
- **透明毛玻璃 UI**: 采用现代透明设计，完美融合桌面背景。
- **边缘吸附与隐藏**: 窗口靠近屏幕边缘（左/右/上）时自动缩进隐藏，鼠标悬停时自动呼出，不占用屏幕空间。
- **全局快捷键**: 支持通过自定义快捷键快速呼出/隐藏应用。
- **高度定制化**: 支持调整窗口尺寸、背景颜色、透明度及字号。
- **数据本地化**: 所有待办事项和配置均持久化存储在本地。
- **极速体验**: 基于 Rust (Tauri) 后端，内存占用极低。

## 2. 整体结构

项目采用 Tauri 默认的前后端分离架构：

```text
floating-todo-tauri/
├── src-tauri/              # Rust 后端代码
│   ├── src/
│   │   ├── main.rs         # 应用入口
│   │   └── lib.rs          # 核心插件、命令与窗口逻辑
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 窗口与系统配置 (V2 格式)
├── src/                    # Vue 3 前端代码
│   ├── assets/             # 静态资源
│   ├── components/         # UI 组件 (标题栏、输入框、列表、设置面板)
│   ├── composables/        # 核心逻辑 (任务管理、设置、国际化、吸附逻辑等)
│   ├── types/              # TypeScript 类型定义
│   ├── App.vue             # 根组件与主布局
│   ├── main.ts             # 前端入口
│   └── style.css           # 全局 CSS 与 Tailwind V4 配置
├── public/                 # 公共资源
├── index.html              # 应用入口 HTML
├── package.json            # 前端依赖与脚本
└── vite.config.ts          # Vite 构建配置
```

## 3. 开发与运行

### 环境准备

确保您的系统中已安装：
- [Node.js](https://nodejs.org/) (推荐 LTS)
- [Rust](https://www.rust-lang.org/) (通过 rustup 安装)
- (Windows 用户) [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建发布 (生成 .exe)

```bash
npm run tauri build
```
编译后的安装包将位于 `src-tauri/target/release/bundle/` 目录下。

## 4. 关键配置

- **透明设置**: 在 `tauri.conf.json` 中 `transparent: true` 配合 CSS `background: transparent` 实现。
- **窗口装饰**: 禁用 `decorations: false` 实现无边框效果。
- **吸附灵敏度**: 可在 `src/composables/useEdgeDocking.ts` 中调整吸附判定像素。

## 5. 开源协议

MIT
