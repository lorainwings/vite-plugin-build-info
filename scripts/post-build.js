#!/usr/bin/env node

/**
 * 后构建脚本
 * 处理水印脚本的最终输出
 */

import fs from 'fs'
import path from 'path'

const distDir = path.resolve('dist')

async function postBuild() {
  try {
    console.log('🔄 Running post-build script...')

    // 检查 dist 目录是否存在
    if (!fs.existsSync(distDir)) {
      console.error('❌ dist directory not found')
      process.exit(1)
    }

    // 重命名水印文件
    const watermarkFiles = ['watermark.js', 'watermark.cjs']

    for (const file of watermarkFiles) {
      const filePath = path.join(distDir, file)
      if (fs.existsSync(filePath)) {
        console.log(`✅ Found watermark file: ${file}`)
      } else {
        console.warn(`⚠️  Watermark file not found: ${file}`)
      }
    }

    // 创建水印脚本的独立版本（用于浏览器直接使用）
    const standalonePath = path.join(distDir, 'watermark.js')
    if (fs.existsSync(standalonePath)) {
      const content = fs.readFileSync(standalonePath, 'utf8')

      // 添加 UMD 包装器
      const umdContent = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Watermark = {}));
})(this, (function (exports) {
  'use strict';

  ${content}

  Object.defineProperty(exports, '__esModule', { value: true });
}));`

      fs.writeFileSync(standalonePath, umdContent)
      console.log('✅ Created UMD version of watermark script')
    }

    console.log('✅ Post-build script completed successfully')
  } catch (error) {
    console.error('❌ Post-build script failed:', error)
    process.exit(1)
  }
}

postBuild()
