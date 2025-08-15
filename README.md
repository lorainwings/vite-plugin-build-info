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
  <strong>🚀 一个强大的 Vite 插件，用于在构建过程中向 <code>index.html</code> 注入构建元数据和版本信息 🚀</strong>
</p>

<p align="center">
  <em>让您的应用构建信息更加透明和可追踪</em>
</p>

---

## ✨ 特性

- 🚀 **自动注入构建信息**：构建时间、版本号、Git 信息等
- 🔧 **高度可配置**：支持自定义字段和注入位置
- 📦 **多种输出格式**：JSON、HTML 注释、Meta 标签、Console.log
- 🌍 **环境信息收集**：Node.js 版本、环境变量等
- 🐳 **CI/CD 友好**：支持 Jenkins、GitHub Actions 等
- 📝 **TypeScript 支持**：完整的类型定义
- 🧪 **测试覆盖**：完整的单元测试
- 🎯 **Console.log 注入**：支持多种格式的控制台输出

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

      // 自定义字段
      customFields: {
        buildId: () => `build-${Date.now()}`,
        environment: () => process.env.NODE_ENV || 'development',
        deployTime: () => new Date().toLocaleString(),
        randomValue: () => Math.random().toString(36).substring(7),
      },

      // 注入配置
      injectPosition: 'head',
      generateJson: false,
      generateComments: true,
      generateMetaTags: true,
      variableName: '__BUILD_META__',

      // Console.log 注入配置
      generateConsoleLog: true,
      consoleLogFormat: 'simple', // 'simple' | 'detailed' | 'structured'
      consoleLogEmojis: true,

      // 环境变量前缀
      envPrefixes: ['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_'],
    })
  ]
})
```

## 📖 API 文档

### MetaInjectOptions

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `customFields` | `Record<string, string \| number \| boolean \| (() => string \| number \| boolean \| Promise<string \| number \| boolean>)>` | `{}` | 自定义元数据字段 |
| `includeBuildTime` | `boolean` | `true` | 是否包含构建时间 |
| `includeVersion` | `boolean` | `true` | 是否包含构建版本号 |
| `includeGitInfo` | `boolean` | `true` | 是否包含 Git 信息 |
| `includeNodeVersion` | `boolean` | `true` | 是否包含 Node.js 版本 |
| `includeEnvInfo` | `boolean` | `false` | 是否包含环境变量信息 |
| `envPrefixes` | `string[]` | `['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_']` | 要包含的环境变量前缀 |
| `injectPosition` | `'head' \| 'body' \| 'custom'` | `'head'` | 注入位置 |
| `customSelector` | `string` | - | 自定义注入选择器（当 injectPosition 为 'custom' 时使用） |
| `generateJson` | `boolean` | `false` | 是否生成 JSON 格式的元数据 |
| `generateComments` | `boolean` | `true` | 是否生成注释格式的元数据 |
| `generateMetaTags` | `boolean` | `true` | 是否生成 meta 标签 |
| `generateConsoleLog` | `boolean` | `false` | 是否生成 console.log 输出 |
| `consoleLogFormat` | `'structured' \| 'simple' \| 'detailed'` | `'simple'` | console.log 输出格式 |
| `consoleLogEmojis` | `boolean` | `true` | 是否在 console.log 中使用表情符号 |
| `variableName` | `string` | `'__BUILD_META__'` | 元数据变量名（用于在 HTML 中访问） |
| `injectInDev` | `boolean` | `false` | 是否在开发模式下也注入（仅用于调试） |

### 注入的元数据结构

```typescript
interface BuildMetadata {
  buildTime: string           // 本地化格式的构建时间
  buildTimestamp: number      // 构建时间戳（毫秒）
  version?: string           // 版本号（来自 package.json）
  git?: {                    // Git 信息
    branch?: string          // 当前分支
    commit?: string          // 提交哈希
    commitHash?: string      // 提交哈希（别名）
    commitMessage?: string   // 提交信息
    author?: string          // 作者
    email?: string           // 作者邮箱
    remote?: string          // 远程仓库地址
    tag?: string             // 最新标签
    short?: string           // 短提交哈希（前7位）
  }
  nodeVersion: string        // Node.js 版本
  ci?: {                     // CI 信息
    jenkinsNodeName?: string // Jenkins 节点名
    jenkinsExecutorNumber?: string // Jenkins 执行器编号
    jenkinsBuildNumber?: string   // Jenkins 构建号
    jenkinsJobName?: string       // Jenkins 任务名
    githubRunId?: string          // GitHub Actions 运行 ID
    githubRunNumber?: string      // GitHub Actions 运行编号
    provider?: string             // CI 提供商名称
    containerId?: string          // CI 容器标识
  }
  env?: Record<string, string> // 环境变量
  custom?: Record<string, string | number | boolean> // 自定义字段
}
```

## 🎯 使用示例

### 1. 基础用法

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 插件会自动注入构建信息 -->
</head>
<body>
  <script>
    // 访问注入的构建信息
    console.log(window.__BUILD_META__)
  </script>
</body>
</html>
```

### 2. 自定义字段

```typescript
releaseInfo({
  customFields: {
    // 静态值
    projectName: 'My Awesome Project',

    // 动态值
    buildId: () => `build-${Date.now()}`,

    // 异步值
    apiVersion: async () => {
      const response = await fetch('/api/version')
      return response.text()
    }
  }
})
```

### 3. 环境变量收集

```typescript
releaseInfo({
  includeEnvInfo: true,
  envPrefixes: ['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_']
})
```

### 4. 自定义注入位置

```typescript
releaseInfo({
  injectPosition: 'custom',
  customSelector: '#build-info'
})
```

### 5. Console.log 注入

```typescript
releaseInfo({
  // 启用 console.log 注入
  generateConsoleLog: true,

  // 选择输出格式
  consoleLogFormat: 'simple', // 'simple' | 'detailed' | 'structured'

  // 是否使用表情符号
  consoleLogEmojis: true,

  // 其他配置...
})
```

#### Console.log 输出格式

**Simple 格式**：简洁的单行输出（默认）

```md
🚀 构建信息:
  版本: 1.0.0
  构建时间: 2025-01-27T10:30:00.000Z
  Git 分支: main
  Node 版本: v18.17.0
```

**Detailed 格式**：详细的分组输出

```md
🚀 构建信息
📦 版本: 1.0.0
⏰ 构建时间: 2025-01-27T10:30:00.000Z
🔧 Git 信息:
    分支: main
    提交: abc1234
    作者: Developer
🟢 Node 版本: v18.17.0
```

**Structured 格式**：结构化的分组输出

```md
🚀 构建信息
✅ 🚀 构建信息
📦 版本: 1.0.0
⏰ 构建时间: 2025-01-27T10:30:00.000Z

🔧 Git 信息:
    分支: main
    提交: abc1234
    作者: Developer
🟢 Node 版本: v18.17.0
```

## 🧪 测试

```bash
pnpm test
pnpm run test:coverage
pnpm run type-check
pnpm run lint
```

## 📝 开发

```bash
# 克隆仓库
git clone https://github.com/lorainwings/vite-plugin-release-info.git
cd vite-plugin-release-info

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行示例
pnpm example
```

## 🚀 发布

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范自动生成 changelog。

```bash
# 提交代码时使用规范格式
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"

# 发布新版本
pnpm bumpp:patch  # 补丁版本 (0.0.1 → 0.0.2)
pnpm bumpp:minor  # 次要版本 (0.0.1 → 0.1.0)
pnpm bumpp:major  # 主要版本 (0.0.1 → 1.0.0)
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 支持

如果你遇到问题或有建议，请：

1. 查看 [Issues](https://github.com/yourusername/vite-plugin-release-info/issues)
2. 创建新的 Issue
3. 联系维护者

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
