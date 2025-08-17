<p align="center">
  <img src="./favicon.ico" alt="Vite Plugin Release Info Banner" width="280" />
</p>

<h1 align="center"><b>vite-plugin-release-info</b></h1>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-release-info"><img src="https://img.shields.io/npm/v/vite-plugin-release-info?color=42b883&label=Npm&logo=npm" alt="Npm"></a>
  <a href="https://www.npmjs.com/package/vite-plugin-release-info"><img src="https://img.shields.io/npm/dt/vite-plugin-release-info?label=Downloads&logo=npm" alt="Downloads"></a>
  <a href="https://github.com/lorainwings/vite-plugin-release-info/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lorainwings/vite-plugin-release-info?color=blue&label=License&logo=open-source-initiative" alt="License"></a>
  <a href="https://github.com/lorainwings/vite-plugin-release-info/actions"><img src="https://img.shields.io/github/actions/workflow/status/lorainwings/vite-plugin-release-info/ci.yml?branch=main&label=CI&logo=github" alt="CI"></a>
  <img src="https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Pnpm-10.14-f69220?logo=pnpm&logoColor=white" alt="Pnpm">
  <img src="https://img.shields.io/badge/Vitest-1.6-6e9f18?logo=vitest&logoColor=white" alt="Vitest">
  <img src="https://img.shields.io/badge/Tsup-8.5-007acc?logo=typescript&logoColor=white" alt="Tsup">
  <img src="https://img.shields.io/badge/ESLint-9.33-4B32C3?logo=eslint&logoColor=white" alt="ESLint">
  <img src="https://img.shields.io/badge/Prettier-3.6-F7B93E?logo=prettier&logoColor=white" alt="Prettier">
</p>

<p align="center">
  <strong>🚀 一个强大的 Vite 插件，用于在构建过程中向 <code>index.html</code> 注入构建元数据和暗水印功能 🚀</strong>
</p>

<p align="center">
  <em>让您的应用构建信息更加透明和可追踪，同时提供强大的版权保护</em>
</p>

---

## ✨ 特性

- 🚀 **自动注入构建信息**：构建时间、版本号、Git 信息等
- 🔒 **暗水印保护**：像素级 RGBA 暗水印，保护应用版权
- 🔧 **高度可配置**：支持自定义字段和注入位置
- 📦 **多种输出格式**：JSON、HTML 注释、Meta 标签、Console.log
- 🌍 **环境信息收集**：Node.js 版本、环境变量等
- 🐳 **CI/CD 友好**：支持 Jenkins、GitHub Actions 等
- 📝 **TypeScript 支持**：完整的类型定义
- 🧪 **测试覆盖**：完整的单元测试
- 🎯 **Console.log 注入**：支持多种格式的控制台输出
- 🏷️ **智能发布检测**：自动识别分支、标签或提交发布类型

## 📦 安装

```bash
pnpm add vite-plugin-release-info
```

## 🚀 快速开始

### 基础用法

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import releaseInfo from 'vite-plugin-release-info'

export default defineConfig({
  plugins: [
    releaseInfo()
  ]
})
```

### 启用暗水印

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import releaseInfo from 'vite-plugin-release-info'

export default defineConfig({
  plugins: [
    releaseInfo({
      watermark: {
        enabled: true,
        opacity: 0.1,
        position: 'center'
      }
    })
  ]
})
```

**注意**：插件默认只在生产构建时注入元数据。如需在开发模式下也注入，请设置 `injectInDev: true`。

## 🔧 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `includeBuildTime` | `boolean` | `true` | 是否包含构建时间 |
| `includeVersion` | `boolean` | `true` | 是否包含构建版本号 |
| `includeGitInfo` | `boolean` | `true` | 是否包含 Git 信息 |
| `includeNodeVersion` | `boolean` | `true` | 是否包含 Node.js 版本 |
| `includeEnvInfo` | `boolean` | `false` | 是否包含环境变量信息 |

### 暗水印配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `watermark.enabled` | `boolean` | `false` | 是否启用暗水印 |
| `watermark.opacity` | `number` | `0.1` | 水印透明度 (0-1) |
| `watermark.position` | `string` | `'center'` | 水印位置 |
| `watermark.size` | `string` | `'cover'` | 水印大小 |
| `watermark.zIndex` | `number` | `9999` | 水印层级 |

### 高级配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import releaseInfo from 'vite-plugin-release-info'

export default defineConfig({
  plugins: [
    releaseInfo({
      // 基础配置
      includeBuildTime: true,
      includeVersion: true,
      includeGitInfo: true,
      includeNodeVersion: true,
      includeEnvInfo: true,

      // 环境变量配置
      envPrefixes: ['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_'],

      // 注入配置
      injectPosition: 'head',
      generateJson: true,
      generateComments: true,
      generateMetaTags: true,
      generateConsoleLog: true,
      consoleLogFormat: 'detailed',
      consoleLogEmojis: true,
      variableName: '__BUILD_META__',

      // 暗水印高级配置
      watermark: {
        enabled: true,
        opacity: 0.05,
        position: 'center',
        size: 'cover',
        zIndex: 9999,
        enableMutationObserver: true,
        enableResizeObserver: true,
        customText: (metadata) => `${metadata.version} - ${metadata.buildTime}`,
        customStyle: {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#000000'
        }
      },

      // 自定义字段
      customFields: {
        buildId: () => `build-${Date.now()}`,
        environment: () => process.env.NODE_ENV || 'development',
        deployTime: () => new Date().toLocaleString(),
        randomValue: () => Math.random().toString(36).substring(7),
        userAgent: () => navigator.userAgent,
        screenResolution: () => `${screen.width}x${screen.height}`,
        timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  ]
})
```

## 🔍 暗水印解析

访问 [暗水印解析器](https://lorainwings.github.io/vite-plugin-release-info/) 来解析应用中的暗水印信息。

### 技术原理

暗水印使用 LSB (Least Significant Bit) 技术，将水印数据嵌入到图片的 Alpha 通道中：

1. **编码过程**：将元数据编码为二进制流，嵌入到像素的 Alpha 通道最低位
2. **解码过程**：从 Alpha 通道提取最低位，重建原始数据
3. **数据验证**：使用校验和确保数据完整性

### 特点

- 🔒 **不可见性**：水印完全不可见，不影响视觉效果
- 🛡️ **抗干扰性**：对图片压缩、格式转换有一定抵抗力
- 📊 **数据完整性**：包含校验和验证，确保数据准确
- 🚀 **高性能**：本地处理，无需网络请求

## 📚 更多示例

查看 [example/](example/) 目录获取更多使用示例。

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage

# 运行集成测试
pnpm test:integration

# 运行性能测试
pnpm test:performance
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/lorainwings/vite-plugin-release-info.git
cd vite-plugin-release-info

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行示例
pnpm example
```

## 许可证

MIT License
