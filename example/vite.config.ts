import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import releaseInfo from '../src/index'

export default defineConfig({
  plugins: [
    releaseInfo({
      // // 基础配置
      // includeBuildTime: true,
      // includeVersion: true,
      // includeGitInfo: true,
      // includeNodeVersion: true,
      // includeEnvInfo: true,

      // // 自定义字段
      // customFields: {
      //   buildId: () => `build-${Date.now()}`,
      //   environment: () => process.env.NODE_ENV || 'development',
      //   deployTime: () => new Date().toLocaleString(),
      //   randomValue: () => Math.random().toString(36).substring(7),
      // },

      // // 注入配置
      // injectPosition: 'head',
      // generateJson: true,
      // generateComments: true,
      // generateMetaTags: true,
      // variableName: 'BUILD_INFO',

      // 新增：console.log 注入配置
      generateConsoleLog: true,
      // consoleLogFormat: 'simple', // 'simple' | 'detailed' | 'structured'
      // consoleLogEmojis: true,

      // 环境变量前缀
      // envPrefixes: ['NODE_ENV', 'BUILD_'],
    }),
  ],
})
