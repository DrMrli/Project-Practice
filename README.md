# IntelliView Browser 智能视图浏览器 🚀

一款基于 Electron 和 Vue3，并深度集成了AI大模型能力的企业级定制浏览器。

## ✨ 核心特性 (Features)

*   **双进程架构**: 基于Electron，稳定、安全、高性能。
*   **现代化前端**: 采用 Vite + Vue3 技术栈，开发体验极佳。
*   **AI智能助手**: 内置侧边栏AI对话，支持网页摘要、划词解释。
*   **企业级规范**: 集成ESLint, Prettier, Husky，保障代码质量。
*   **Git Flow**: 遵循业界标准的团队协作流程。
*   **IPC通信机制**: 实现了主进程与渲染进程之间的安全通信。
*   **系统信息获取**: 通过安全的Preload脚本获取系统信息。
*   **调试支持**: 配置了完整的调试环境，支持主进程和渲染进程调试。
*   **自定义标题栏**: 美观的自定义标题栏，支持拖拽、双击最大化等原生操作。
*   **窗口控制**: 实现了最小化、最大化/还原、关闭等窗口控制功能。
*   **系统托盘**: 支持系统托盘显示、右键菜单和关闭到托盘功能。
*   **地址栏**: 集成地址栏，支持URL输入和智能搜索。
*   **BrowserView**: 内置浏览器内核，支持加载外部网页。
*   **智能URL处理**: 自动补全协议、关键词搜索和安全协议过滤。
*   **窗口拖拽**: 支持窗口边缘拖拽调整大小。

## 🚀 快速上手 (Quick Start)

请确保你已安装 `Node.js` (v20+), `npm` 和 `Git`。

```bash
# 1. 克隆项目到本地
git clone https://github.com/DrMrli/Project-Practice.git

# 2. 进入项目目录
cd Project-Practice

# 3. 安装依赖
npm install

# 4. 启动前端开发服务器
npm run dev

# 5. 启动 Electron 应用（在另一个终端）
npm run electron:dev
```

## 🔧 调试指南 (Debugging)

### 主进程调试
1. 应用已配置为使用 `--inspect=9229` 启动
2. 打开 Chrome 浏览器，访问 `chrome://inspect`
3. 在 "Remote Target" 部分点击 "inspect" 链接

### 渲染进程调试
1. 应用启动时会自动打开开发者工具
2. 在 "Sources" 面板中设置断点
3. 触发相关功能进行调试

## 🛠️ 技术选型 (Tech Stack)
- 核心框架: Electron, Node.js
- 前端框架: Vue.js 3
- 构建工具: Vite
- 代码规范: ESLint, Prettier
- 版本控制: Git
- JSON调试工具: prettyjson

## 📚 教学进度

### 已完成内容
1. 项目初始化与基础配置
2. 上下文隔离与Preload脚本实操
3. 进程间通信（IPC）机制开发
4. 系统信息获取与展示
5. 调试环境配置
6. 自定义标题栏UI布局设计
7. 窗口控制功能实现（最小化、最大化、关闭）
8. 系统托盘（Tray）与右键菜单
9. 地址栏UI与URL导航功能
10. BrowserView容器初始化与挂载
11. 窗口边缘拖拽调整大小功能
12. 智能URL处理与安全协议过滤

## 🤝 贡献指南 (Contributing)

我们非常欢迎你的贡献！请遵循以下流程：

1. Fork 本仓库。
2. 基于 develop 分支创建你的 feature 分支 (e.g. feature/amazing-new-feature)。
3. 进行代码开发，并确保遵循项目的ESLint规范。
4. 提交代码时，请遵循约定式提交 (Conventional Commits) 规范。
5. 创建一个 Pull Request。

由 [你的名字] 和团队成员共同创建。