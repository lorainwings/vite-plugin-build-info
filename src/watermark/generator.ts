/**
 * 水印生成器
 */

import type { BuildMetadata, WatermarkOptions, WatermarkData } from '../types'
import {
  calculateChecksum,
  stringToUint8Array,
  createWatermarkError,
  validateWatermarkOptions,
  mergeWatermarkOptions
} from './utils'

/**
 * 水印生成器类
 */
export class WatermarkGenerator {
  private readonly options: Required<WatermarkOptions>

  constructor(options?: WatermarkOptions) {
    const validation = validateWatermarkOptions(options || {})
    if (!validation.success) {
      throw validation.error
    }

    this.options = mergeWatermarkOptions(options)
  }

  /**
   * 生成暗水印画布
   * @param metadata - 构建元数据
   * @returns 包含水印的 Canvas 元素
   */
  async generate(metadata: BuildMetadata): Promise<HTMLCanvasElement> {
    try {
      // 创建水印数据
      const watermarkData: WatermarkData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata,
        checksum: ''
      }

      // 计算校验和
      const dataString = JSON.stringify(watermarkData.metadata)
      const dataBytes = stringToUint8Array(dataString)
      watermarkData.checksum = calculateChecksum(dataBytes)

      // 编码水印数据
      const encodedData = this.encodeMetadata(watermarkData)

      // 创建画布
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw createWatermarkError('ENCODE_FAILED', 'Failed to get 2D context')
      }

      // 设置画布尺寸
      canvas.width = 800
      canvas.height = 600

      // 创建背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // 嵌入水印
      const watermarkedImageData = this.embedWatermark(imageData, encodedData)

      // 将水印图像数据放回画布
      ctx.putImageData(watermarkedImageData, 0, 0)

      return canvas
    } catch (error) {
      throw createWatermarkError(
        'ENCODE_FAILED',
        'Failed to generate watermark',
        error
      )
    }
  }

  /**
   * 编码元数据为二进制格式
   * @param data - 水印数据
   * @returns 编码后的二进制数据
   */
  encodeMetadata(data: WatermarkData): Uint8Array {
    try {
      const jsonString = JSON.stringify(data)
      const encoded = stringToUint8Array(jsonString)

      // 添加长度前缀（4字节）
      const length = encoded.length
      const lengthBytes = new Uint8Array(4)
      lengthBytes[0] = (length >> 24) & 0xff
      lengthBytes[1] = (length >> 16) & 0xff
      lengthBytes[2] = (length >> 8) & 0xff
      lengthBytes[3] = length & 0xff

      // 合并长度和数据
      const result = new Uint8Array(lengthBytes.length + encoded.length)
      result.set(lengthBytes, 0)
      result.set(encoded, lengthBytes.length)

      return result
    } catch (error) {
      throw createWatermarkError(
        'ENCODE_FAILED',
        'Failed to encode metadata',
        error
      )
    }
  }

  /**
   * 将水印嵌入到图像数据中
   * @param imageData - 原始图像数据
   * @param watermark - 水印数据
   * @returns 包含水印的图像数据
   */
  embedWatermark(imageData: ImageData, watermark: Uint8Array): ImageData {
    try {
      const { data, width, height } = imageData
      const result = new ImageData(new Uint8ClampedArray(data), width, height)

      // 检查图像数据是否足够大
      const requiredPixels = watermark.length * 8 // 每个字节需要8个像素（每个像素1位）
      if (width * height < requiredPixels) {
        throw createWatermarkError(
          'ENCODE_FAILED',
          'Image too small to embed watermark'
        )
      }

      // 使用 LSB 技术嵌入水印到 Alpha 通道
      for (let i = 0; i < watermark.length; i++) {
        const byte = watermark[i]

        // 将字节的8位分别嵌入到8个像素的Alpha通道最低位
        for (let bit = 0; bit < 8; bit++) {
          const pixelIndex = i * 8 + bit
          if (pixelIndex < width * height) {
            const dataIndex = pixelIndex * 4 + 3 // Alpha 通道索引
            const currentAlpha = result.data[dataIndex]
            const bitValue = (byte >> bit) & 1

            // 清除最低位并设置新的位值
            result.data[dataIndex] = (currentAlpha & 0xfe) | bitValue
          }
        }
      }

      return result
    } catch (error) {
      throw createWatermarkError(
        'ENCODE_FAILED',
        'Failed to embed watermark',
        error
      )
    }
  }

  /**
   * 创建水印文本画布
   * @param metadata - 构建元数据
   * @returns 水印文本画布
   */
  createWatermarkCanvas(metadata: BuildMetadata): HTMLCanvasElement {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw createWatermarkError('ENCODE_FAILED', 'Failed to get 2D context')
      }

      // 生成水印文本
      const text = this.options.customText
        ? this.options.customText(metadata)
        : this.generateDefaultText(metadata)

      // 设置画布尺寸
      canvas.width = 400
      canvas.height = 200

      // 设置样式
      const style = this.options.customStyle || {}
      ctx.font = `${style.fontSize || '14px'} ${style.fontFamily || 'Arial, sans-serif'}`
      ctx.fillStyle = style.color || '#000000'
      ctx.globalAlpha = this.options.opacity

      // 绘制文本
      const lines = text.split('\n')
      const lineHeight = 20
      const startY = canvas.height / 2 - (lines.length * lineHeight) / 2

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight
        ctx.fillText(line, 20, y)
      })

      return canvas
    } catch (error) {
      throw createWatermarkError(
        'ENCODE_FAILED',
        'Failed to create watermark canvas',
        error
      )
    }
  }

  /**
   * 生成默认水印文本
   * @param metadata - 构建元数据
   * @returns 水印文本
   */
  private generateDefaultText(metadata: BuildMetadata): string {
    const parts: string[] = []

    if (metadata.version) {
      parts.push(`Version: ${metadata.version}`)
    }

    if (metadata.buildTime) {
      const date = new Date(metadata.buildTime)
      parts.push(`Build: ${date.toLocaleDateString()}`)
    }

    if (metadata.git?.branch) {
      parts.push(`Branch: ${metadata.git.branch}`)
    }

    if (metadata.git?.commit) {
      parts.push(`Commit: ${metadata.git.commit.substring(0, 8)}`)
    }

    return parts.join('\n')
  }
}
