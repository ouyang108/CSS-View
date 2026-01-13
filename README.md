# CSS View - Chrome 插件

一个强大的 Chrome 浏览器插件，帮助开发者快速查看和分析 DOM 元素的 CSS 属性。

## 功能特性

- � **快速查看**：一键查看网页中任意 DOM 元素的完整 CSS 属性
- 📋 **属性详情**：详细展示所有 CSS 属性，包括继承属性和计算值
- 🔍 **属性搜索**：支持快速搜索和筛选 CSS 属性
- 🎨 **视觉化展示**：美观的界面设计，提升开发体验
- 📱 **响应式设计**：完美适配不同屏幕尺寸
- 🔥 **实时更新**：当元素样式变化时，实时更新显示的属性信息

## 技术栈

- **Vue 3** - 现代前端框架，使用 `<script setup>` 语法
- **TypeScript** - 类型安全的 JavaScript 超集
- **WXT** - 强大的浏览器扩展开发框架
- **Vue 3 Toastify** - 优雅的通知提示组件
- **WebExt Bridge** - 浏览器扩展通信库

## 开发环境

### 安装依赖

```bash
npm install
# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
# 开发 Chrome 版本
npm run dev

# 开发 Firefox 版本
npm run dev:firefox
```

### 构建

```bash
# 构建 Chrome 版本
npm run build

# 构建 Firefox 版本
npm run build:firefox
```

### 打包

```bash
# 打包 Chrome 版本
npm run zip

# 打包 Firefox 版本
npm run zip:firefox
```

### 代码检查和格式化

```bash
# 检查代码
npm run lint

# 自动修复代码
npm run lint:fix
```

### 类型检查

```bash
npm run compile
```

## 使用方法

### 安装插件

1. 克隆或下载项目
2. 运行 `npm run build` 构建插件
3. 在 Chrome 浏览器中打开 `chrome://extensions/`
4. 开启 "开发者模式"
5. 点击 "加载已解压的扩展程序"
6. 选择项目的 `dist` 目录

### 使用插件

1. 点击浏览器右上角的插件图标
2. 在弹出的面板中，可修改配置和展示的css属性
3. 将鼠标移动到网页上任意元素
4. 按下自定义按键即可查看其完整的 CSS 属性

## 项目结构

```
CSS-View/
├─ assets/                 # 静态资源文件
├─ components/             # 可复用组件
├─ constants/              # 常量定义
├─ entrypoints/            # 浏览器扩展入口
│  ├─ popup/              # 弹窗页面
│  ├─ cssPage/            # CSS 属性查看页面
│  ├─ background.ts       # 后台脚本
│  └─ content.ts          # 内容脚本
├─ hooks/                  # 自定义钩子
├─ public/                 # 公共资源
├─ utils/                  # 工具函数
├─ package.json           # 项目配置
└─ wxt.config.ts          # WXT 框架配置
```

## 核心功能说明

### CSS 属性查看页面 (`entrypoints/cssPage/`)

- `index.vue` - 主页面组件，包含属性查看和筛选功能
- `components/cssAttribute.vue` - 单个属性的展示组件
- `components/dialog.vue` - 对话框组件
- `index.css` - 页面样式文件

### 弹窗页面 (`entrypoints/popup/`)

- `App.vue` - 主弹窗组件
- `main.ts` - 入口文件
- `style.css` - 样式文件

### 后台和内容脚本

- `background.ts` - 插件后台脚本，处理扩展程序的生命周期
- `content.ts` - 内容脚本，注入到网页中，用于与 DOM 元素交互

## 开发规范

本项目遵循以下开发规范：

- 使用 Vue 3 `<script setup>` 语法
- 组件命名采用大驼峰（PascalCase）
- 所有 `ref` 都有明确的类型标注
- 使用 TypeScript 严格类型检查
- 遵循 ESLint 代码规范

## 提交规范

使用 Commitizen 进行规范化提交：

```bash
npm run commit
```
## 后续开发
1. 增加自定义按键配置
2. 提高css属性查看窗的位置显示

## 浏览器支持

- Chrome 90+
- Firefox 90+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
