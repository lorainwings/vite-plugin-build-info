/**
 * 独立运行的水印脚本
 * 完全自包含，不依赖外部库
 */

import type { Any } from '../types'

// 类型定义
interface WatermarkConfig {
  enabled?: boolean
  opacity?: number
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  size?: 'cover' | 'contain' | 'auto'
  zIndex?: number
  enableMutationObserver?: boolean
  enableResizeObserver?: boolean
  customText?: string
  customStyle?: {
    fontFamily?: string
    fontSize?: string
    color?: string
    fontWeight?: string | number
  }
}

interface BuildMetadata {
  buildTime: string
  buildTimestamp: number
  version?: string
  git?: {
    branch?: string
    commit?: string
    commitHash?: string
    author?: string
    email?: string
  }
  nodeVersion: string
  custom?: Record<string, string | number | boolean>
}

// 工具函数
function debounce<T extends (...args: Any[]) => Any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

function throttle<T extends (...args: Any[]) => Any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 水印管理器
class WatermarkManager {
  private config: Required<WatermarkConfig>
  private metadata: BuildMetadata | null = null
  private watermarkElement: HTMLElement | null = null
  private mutationObserver: MutationObserver | null = null
  private resizeObserver: ResizeObserver | null = null
  private isInitialized = false

  constructor(config: WatermarkConfig = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      opacity: config.opacity ?? 0.1,
      position: config.position ?? 'center',
      size: config.size ?? 'cover',
      zIndex: config.zIndex ?? 9999,
      enableMutationObserver: config.enableMutationObserver ?? true,
      enableResizeObserver: config.enableResizeObserver ?? true,
      customText: config.customText ?? '',
      customStyle: config.customStyle ?? {}
    }
  }

  /**
   * 初始化水印
   */
  init(): void {
    try {
      if (this.isInitialized || !this.config.enabled) {
        return
      }

      // 获取元数据
      this.metadata = this.getMetadata()

      // 创建水印元素
      this.createWatermarkElement()

      // 设置监听器
      this.setupObservers()

      this.isInitialized = true
    } catch (error) {
      console.warn('Watermark initialization failed:', error)
    }
  }

  /**
   * 获取构建元数据
   */
  private getMetadata(): BuildMetadata {
    try {
      // 尝试从全局变量获取元数据
      const globalMetadata = (window as Any).__BUILD_META__
      if (globalMetadata) {
        return globalMetadata
      }

      // 从 meta 标签获取
      const metaTags = document.querySelectorAll('meta[name^="build-"]')
      const metadata: Any = {}

      metaTags.forEach((tag) => {
        const name = tag.getAttribute('name')?.replace('build-', '')
        const content = tag.getAttribute('content')
        if (name && content) {
          metadata[name] = content
        }
      })

      return metadata
    } catch (error) {
      console.warn('Failed to get metadata:', error)
      return {
        buildTime: new Date().toISOString(),
        buildTimestamp: Date.now(),
        nodeVersion: 'unknown'
      }
    }
  }

  /**
   * 创建水印元素
   */
  private createWatermarkElement(): void {
    try {
      // 移除现有水印
      this.removeWatermarkElement()

      // 创建水印容器
      const container = document.createElement('div')
      container.id = 'vite-plugin-watermark'
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${this.config.zIndex};
        overflow: hidden;
      `

      // 创建水印画布
      const canvas = this.createWatermarkCanvas()
      if (canvas) {
        container.appendChild(canvas)
      }

      // 添加到页面
      document.body.appendChild(container)
      this.watermarkElement = container
    } catch (error) {
      console.warn('Failed to create watermark element:', error)
    }
  }

  /**
   * 创建水印画布
   */
  private createWatermarkCanvas(): HTMLCanvasElement | null {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return null
      }

      // 生成水印文本
      const text = this.generateWatermarkText()

      // 设置画布尺寸
      canvas.width = 400
      canvas.height = 200

      // 设置样式
      const style = this.config.customStyle
      ctx.font = `${style.fontSize || '14px'} ${style.fontFamily || 'Arial, sans-serif'}`
      ctx.fillStyle = style.color || '#000000'
      ctx.globalAlpha = this.config.opacity

      // 绘制文本
      const lines = text.split('\n')
      const lineHeight = 20
      const startY = canvas.height / 2 - (lines.length * lineHeight) / 2

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight
        ctx.fillText(line, 20, y)
      })

      // 设置画布样式
      canvas.style.cssText = `
        position: absolute;
        ${this.getPositionStyles()};
        ${this.getSizeStyles()};
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      `

      return canvas
    } catch (error) {
      console.warn('Failed to create watermark canvas:', error)
      return null
    }
  }

  /**
   * 生成水印文本
   */
  private generateWatermarkText(): string {
    if (this.config.customText) {
      return this.config.customText
    }

    if (!this.metadata) {
      return 'Watermark'
    }

    const parts: string[] = []

    if (this.metadata.version) {
      parts.push(`Version: ${this.metadata.version}`)
    }

    if (this.metadata.buildTime) {
      const date = new Date(this.metadata.buildTime)
      parts.push(`Build: ${date.toLocaleDateString()}`)
    }

    if (this.metadata.git?.branch) {
      parts.push(`Branch: ${this.metadata.git.branch}`)
    }

    if (this.metadata.git?.commit) {
      parts.push(`Commit: ${this.metadata.git.commit.substring(0, 8)}`)
    }

    return parts.length > 0 ? parts.join('\n') : 'Watermark'
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): string {
    switch (this.config.position) {
      case 'top-left':
        return 'top: 20px; left: 20px;'
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;'
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;'
      case 'center':
      default:
        return 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }
  }

  /**
   * 获取尺寸样式
   */
  private getSizeStyles(): string {
    switch (this.config.size) {
      case 'cover':
        return 'width: 100%; height: 100%; object-fit: cover;'
      case 'contain':
        return 'width: 100%; height: 100%; object-fit: contain;'
      case 'auto':
      default:
        return ''
    }
  }

  /**
   * 设置观察器
   */
  private setupObservers(): void {
    try {
      // DOM 变化监听
      if (this.config.enableMutationObserver && window.MutationObserver) {
        this.mutationObserver = new MutationObserver(
          debounce(() => {
            this.handleDOMChange()
          }, 100)
        )

        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        })
      }

      // 窗口大小变化监听
      if (this.config.enableResizeObserver && window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(
          throttle(() => {
            this.handleResize()
          }, 100)
        )

        this.resizeObserver.observe(document.body)
      }

      // 窗口 resize 事件
      window.addEventListener(
        'resize',
        throttle(() => {
          this.handleResize()
        }, 100)
      )
    } catch (error) {
      console.warn('Failed to setup observers:', error)
    }
  }

  /**
   * 处理 DOM 变化
   */
  private handleDOMChange(): void {
    try {
      if (
        !this.watermarkElement ||
        !document.body.contains(this.watermarkElement)
      ) {
        this.createWatermarkElement()
      }
    } catch (error) {
      console.warn('Failed to handle DOM change:', error)
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    try {
      // 重新创建水印以适应新的窗口大小
      this.createWatermarkElement()
    } catch (error) {
      console.warn('Failed to handle resize:', error)
    }
  }

  /**
   * 移除水印元素
   */
  private removeWatermarkElement(): void {
    try {
      if (
        this.watermarkElement &&
        document.body.contains(this.watermarkElement)
      ) {
        document.body.removeChild(this.watermarkElement)
      }
      this.watermarkElement = null
    } catch (error) {
      console.warn('Failed to remove watermark element:', error)
    }
  }

  /**
   * 销毁水印
   */
  destroy(): void {
    try {
      // 停止观察器
      if (this.mutationObserver) {
        this.mutationObserver.disconnect()
        this.mutationObserver = null
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }

      // 移除水印元素
      this.removeWatermarkElement()

      this.isInitialized = false
    } catch (error) {
      console.warn('Failed to destroy watermark:', error)
    }
  }
}

// 全局水印管理器实例
let watermarkManager: WatermarkManager | null = null

// 初始化函数
function initWatermark(): void {
  try {
    // 获取配置
    const config = (window as Any).__WATERMARK_CONFIG__ || {}

    // 创建水印管理器
    watermarkManager = new WatermarkManager(config)

    // 初始化水印
    watermarkManager.init()
  } catch (error) {
    console.warn('Failed to initialize watermark:', error)
  }
}

// 销毁函数
function destroyWatermark(): void {
  try {
    if (watermarkManager) {
      watermarkManager.destroy()
      watermarkManager = null
    }
  } catch (error) {
    console.warn('Failed to destroy watermark:', error)
  }
}

// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWatermark)
} else {
  initWatermark()
}

// 导出到全局
;(window as Any).WatermarkManager = WatermarkManager
;(window as Any).initWatermark = initWatermark
;(window as Any).destroyWatermark = destroyWatermark
