import { describe, it, expect } from 'vitest'
import { injectIntoHtml } from '../src/injector'
import type { BuildMetadata } from '../src/types'

describe('injectIntoHtml', () => {
  const mockMetadata: BuildMetadata = {
    buildTime: '2024-01-01T00:00:00.000Z',
    buildTimestamp: 1704067200000,
    version: '1.0.0',
    nodeVersion: 'v18.0.0',
    git: {
      branch: 'main',
      commit: 'abc123',
      author: 'Test User'
    },
    env: {
      NODE_ENV: 'production',
      VITE_APP_TITLE: 'Test App'
    },
    custom: {
      testField: 'test value'
    }
  }

  const mockHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`

  it('should inject JSON metadata into head', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: true,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: false,
      injectPosition: 'head'
    })

    expect(result).toContain('window.__BUILD_META__')
    expect(result).toContain('"buildTime": "2024-01-01T00:00:00.000Z"')
    expect(result).toContain('"version": "1.0.0"')
  })

  it('should inject comments into head', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: false,
      generateComments: true,
      generateMetaTags: false,
      generateConsoleLog: false,
      injectPosition: 'head'
    })

    expect(result).toContain('<!-- Build Metadata -->')
    expect(result).toContain('<!-- Build Time: 2024-01-01T00:00:00.000Z -->')
    expect(result).toContain('<!-- Version: 1.0.0 -->')
  })

  it('should inject meta tags into head', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: false,
      generateComments: false,
      generateMetaTags: true,
      generateConsoleLog: false,
      injectPosition: 'head'
    })

    expect(result).toContain(
      '<meta name="build-time" content="2024-01-01T00:00:00.000Z">'
    )
    expect(result).toContain('<meta name="version" content="1.0.0">')
    expect(result).toContain('<meta name="git-branch" content="main">')
  })

  it('should inject console.log script when enabled', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: false,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: true,
      consoleLogFormat: 'structured',
      consoleLogEmojis: true,
      injectPosition: 'head'
    })

    expect(result).toContain("console.group('%c🚀 构建信息'")
    expect(result).toContain("console.log('%c[release] 版本号%c 1.0.0'")
    expect(result).toContain('console.groupEnd()')
  })

  it('should generate simple format console.log', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateConsoleLog: true,
      consoleLogFormat: 'simple',
      consoleLogEmojis: false
    })

    expect(result).toContain("console.log('%c 构建信息'")
    expect(result).toContain("console.log('%c[release] 版本号%c 1.0.0'")
    expect(result).not.toContain('console.group')
  })

  it('should generate detailed format console.log', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateConsoleLog: true,
      consoleLogFormat: 'detailed',
      consoleLogEmojis: true
    })

    expect(result).toContain("console.group('%c🚀 构建信息'")
    expect(result).toContain('console.groupEnd()')
    expect(result).toContain("console.log('%c⚙️ Git 信息'")
  })

  it('should respect consoleLogEmojis setting', () => {
    const resultWithEmojis = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: false,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: true,
      consoleLogFormat: 'structured',
      consoleLogEmojis: true
    })

    const resultWithoutEmojis = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: false,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: true,
      consoleLogFormat: 'structured',
      consoleLogEmojis: false
    })

    expect(resultWithEmojis).toContain('🚀 构建信息')
    expect(resultWithoutEmojis).not.toContain('🚀')
  })

  it('should inject into body when specified', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: true,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: false,
      injectPosition: 'body'
    })

    expect(result).toContain('window.__BUILD_META__')
    // 验证脚本在 </body> 标签之前
    const bodyEndIndex = result.indexOf('</body>')
    const scriptIndex = result.indexOf('window.__BUILD_META__')
    expect(scriptIndex).toBeLessThan(bodyEndIndex)
    expect(scriptIndex).toBeGreaterThan(0)
  })

  it('should use custom variable name', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: true,
      generateComments: false,
      generateMetaTags: false,
      generateConsoleLog: false,
      variableName: 'CUSTOM_META'
    })

    expect(result).toContain('window.CUSTOM_META')
    expect(result).not.toContain('window.__BUILD_META__')
  })

  it('should inject all types when all are enabled', () => {
    const result = injectIntoHtml(mockHtml, mockMetadata, {
      generateJson: true,
      generateComments: true,
      generateMetaTags: true,
      generateConsoleLog: true,
      consoleLogFormat: 'structured',
      consoleLogEmojis: true
    })

    expect(result).toContain('<script>window.__BUILD_META__')
    expect(result).toContain('<!-- Build Metadata -->')
    expect(result).toContain('<meta name="build-time"')
    expect(result).toContain("console.group('%c🚀 构建信息'")
  })

  it('should handle empty metadata gracefully', () => {
    const emptyMetadata: BuildMetadata = {
      buildTime: '2024-01-01T00:00:00.000Z',
      buildTimestamp: 1704067200000,
      nodeVersion: 'v18.0.0'
    }

    const result = injectIntoHtml(mockHtml, emptyMetadata, {
      generateJson: true,
      generateComments: true,
      generateMetaTags: true,
      generateConsoleLog: true
    })

    expect(result).toContain('<script>window.__BUILD_META__')
    expect(result).toContain('<!-- Build Metadata -->')
    expect(result).toContain('<meta name="build-time"')
    expect(result).toContain("console.log('%c🚀 构建信息'")
  })
})
