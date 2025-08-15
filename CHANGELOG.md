# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features

- New features coming soon...

### 🐛 Bug Fixes

- Bug fixes...

### 📚 Documentation

- Documentation updates...

## [0.0.4] - 2025-08-15

### 🎉 Initial Release

This is the first official release of the `vite-plugin-release-info` plugin, providing complete build metadata injection functionality.

### ✨ Features

#### Core Features

- **Build Information Injection**: Automatically inject build time, version number and other metadata into `index.html`
- **Git Information Collection**: Automatically collect Git-related information such as current branch, commit hash, author, etc.
- **Environment Information Collection**: Support collecting system information such as Node.js version, environment variables, etc.
- **Multiple Output Formats**: Support multiple injection formats including JSON, HTML comments, Meta tags, etc.

#### Configuration Options

- **Highly Configurable**: Support custom fields, injection positions, output formats, etc.
- **Environment Variable Filtering**: Configurable environment variable prefixes to include
- **Development Mode Control**: Choose whether to inject metadata in development mode
- **Custom Selector**: Support custom HTML injection positions

#### Technical Features

- **TypeScript Support**: Complete type definitions and type checking
- **Async Field Support**: Support async functions to generate dynamic metadata
- **CI/CD Friendly**: Support continuous integration environments such as Jenkins, GitHub Actions, etc.
- **Performance Optimized**: Efficient build-time metadata collection and injection

### 🔧 Technical Implementation

#### Core Modules

- `injector.ts`: Main injection logic implementation
- `metadata.ts`: Metadata collection and processing
- `types.ts`: Complete TypeScript type definitions
- `index.ts`: Plugin entry and configuration

#### Dependency Management

- **Runtime Dependencies**: `simple-git` for Git information collection
- **Dev Dependencies**: Complete TypeScript, ESLint, Prettier, Vitest toolchain
- **Build Tools**: Use `tsup` for TypeScript building and packaging

#### Test Coverage

- **Unit Tests**: Complete test coverage using Vitest
- **Type Checking**: TypeScript compile-time type checking
- **Code Quality**: ESLint + Prettier code specification checking

### 📦 Package Information

- **Package Name**: `vite-plugin-release-info`
- **Version**: 0.0.3
- **License**: MIT
- **Node.js Requirement**: >= 18.0.0
- **Vite Compatibility**: ^4.0.0 || ^5.0.0

### 🚀 Usage

#### Basic Installation

```bash
pnpm add vite-plugin-release-info
```

#### Basic Configuration

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

#### Advanced Configuration

```typescript
releaseInfo({
  includeBuildTime: true,
  includeVersion: true,
  includeGitInfo: true,
  includeNodeVersion: true,
  includeEnvInfo: true,
  customFields: {
    buildId: () => `build-${Date.now()}`,
    environment: () => process.env.NODE_ENV || 'development'
  }
})
```

### 📁 Project Structure

```
vite-plugin-release-info/
├── src/
│   ├── index.ts          # Plugin entry
│   ├── injector.ts       # Injection logic
│   ├── metadata.ts       # Metadata processing
│   └── types.ts          # Type definitions
├── tests/                # Test files
├── example/              # Usage examples
├── dist/                 # Build output
└── docs/                 # Documentation (README, CONTRIBUTING, CHANGELOG)
```

### 🧪 Testing and Building

#### Development Commands

```bash
pnpm dev          # Development mode (watch file changes)
pnpm build        # Build project
pnpm test         # Run tests
pnpm test:coverage # Test coverage
pnpm type-check   # Type checking
pnpm lint         # Code linting
pnpm format       # Code formatting
```

#### Example Project

```bash
pnpm example      # Run example project
pnpm example:build # Build example project
```

### 🔗 Related Links

- **GitHub Repository**: <https://github.com/lorainwings/vite-plugin-release-info>
- **NPM Package**: <https://www.npmjs.com/package/vite-plugin-release-info>
- **Issue Feedback**: <https://github.com/lorainwings/vite-plugin-release-info/issues>
- **License**: MIT License

### 🙏 Acknowledgments

Thanks to all developers who contributed to this project, especially:

- Vite team for the excellent build tools
- TypeScript team for the type system
- Open source community for support and feedback

---

**Note**: This is the first version of the project. Although the functionality is complete, there may still be some edge cases. If you encounter any issues during use, please provide feedback in time, and we will continue to improve.
