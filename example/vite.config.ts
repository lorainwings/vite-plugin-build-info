import { defineConfig } from 'vite'
import releaseInfo from '../src/index'

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
      generateJson: false,
      generateComments: true,
      generateMetaTags: false,
      generateConsoleLog: false,
      consoleLogFormat: 'detailed',
      consoleLogEmojis: true,
      variableName: '__BUILD_META__',

      // 暗水印配置
      watermark: {
        enabled: true,
        opacity: 0.1,
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
        timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  ]
})
