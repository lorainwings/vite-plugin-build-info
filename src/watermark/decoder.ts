/**
 * 水印解码器
 */

import type { BuildMetadata, WatermarkData } from '../types'
import {
  uint8ArrayToString,
  createWatermarkError,
  validateChecksum
} from './utils'

/**
 * 水印解码器类
 */
export class WatermarkDecoder {
  /**
   * 从图像数据中解码水印
   * @param imageData - 图像数据
   * @returns 解码后的水印数据
   */
  async decode(imageData: ImageData): Promise<BuildMetadata> {
    try {
      // 提取水印数据
      const watermarkBytes = this.extractWatermark(imageData)

      // 解码元数据
      const watermarkData = this.decodeMetadata(watermarkBytes)

      // 验证水印完整性
      if (!this.validateWatermark(watermarkData)) {
        throw createWatermarkError(
          'VALIDATION_FAILED',
          'Watermark validation failed'
        )
      }

      return watermarkData.metadata
    } catch (error) {
      throw createWatermarkError(
        'DECODE_FAILED',
        'Failed to decode watermark',
        error
      )
    }
  }

  /**
   * 从图像数据中提取水印数据
   * @param imageData - 图像数据
   * @returns 提取的水印字节数据
   */
  extractWatermark(imageData: ImageData): Uint8Array {
    try {
      const { data, width, height } = imageData
      const pixels = width * height

      // 首先读取长度信息（前4个字节）
      const lengthBytes = new Uint8Array(4)
      for (let i = 0; i < 4; i++) {
        lengthBytes[i] = this.extractByteFromPixels(data, i * 8)
      }

      // 解析长度
      const length =
        (lengthBytes[0] << 24) |
        (lengthBytes[1] << 16) |
        (lengthBytes[2] << 8) |
        lengthBytes[3]

      // 检查长度是否合理
      if (length <= 0 || length > pixels * 4) {
        throw createWatermarkError('DECODE_FAILED', 'Invalid watermark length')
      }

      // 提取数据
      const result = new Uint8Array(length)
      for (let i = 0; i < length; i++) {
        result[i] = this.extractByteFromPixels(data, (i + 4) * 8)
      }

      return result
    } catch (error) {
      throw createWatermarkError(
        'DECODE_FAILED',
        'Failed to extract watermark',
        error
      )
    }
  }

  /**
   * 从像素中提取一个字节
   * @param data - 图像数据
   * @param startPixel - 起始像素索引
   * @returns 提取的字节
   */
  private extractByteFromPixels(
    data: Uint8ClampedArray,
    startPixel: number
  ): number {
    let byte = 0

    for (let bit = 0; bit < 8; bit++) {
      const pixelIndex = startPixel + bit
      if (pixelIndex < data.length / 4) {
        const alphaIndex = pixelIndex * 4 + 3 // Alpha 通道索引
        const alpha = data[alphaIndex]
        const bitValue = alpha & 1 // 获取最低位
        byte |= bitValue << bit
      }
    }

    return byte
  }

  /**
   * 解码元数据
   * @param data - 水印字节数据
   * @returns 解码后的水印数据
   */
  decodeMetadata(data: Uint8Array): WatermarkData {
    try {
      const jsonString = uint8ArrayToString(data)
      const watermarkData: WatermarkData = JSON.parse(jsonString)

      // 验证必要字段
      if (
        !watermarkData.version ||
        !watermarkData.metadata ||
        !watermarkData.checksum
      ) {
        throw createWatermarkError(
          'DECODE_FAILED',
          'Invalid watermark data structure'
        )
      }

      return watermarkData
    } catch (error) {
      throw createWatermarkError(
        'DECODE_FAILED',
        'Failed to decode metadata',
        error
      )
    }
  }

  /**
   * 验证水印完整性
   * @param data - 水印数据
   * @returns 是否有效
   */
  validateWatermark(data: WatermarkData): boolean {
    try {
      // 验证时间戳
      if (data.timestamp <= 0 || data.timestamp > Date.now()) {
        return false
      }

      // 验证版本
      if (!data.version || typeof data.version !== 'string') {
        return false
      }

      // 验证元数据
      if (!data.metadata || typeof data.metadata !== 'object') {
        return false
      }

      // 验证校验和
      const metadataString = JSON.stringify(data.metadata)
      const metadataBytes = new TextEncoder().encode(metadataString)

      return validateChecksum(metadataBytes, data.checksum)
    } catch {
      return false
    }
  }

  /**
   * 检查图像是否包含水印
   * @param imageData - 图像数据
   * @returns 是否包含水印
   */
  hasWatermark(imageData: ImageData): boolean {
    try {
      this.extractWatermark(imageData)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取水印信息（不验证）
   * @param imageData - 图像数据
   * @returns 水印信息或 null
   */
  getWatermarkInfo(imageData: ImageData): WatermarkData | null {
    try {
      const watermarkBytes = this.extractWatermark(imageData)
      return this.decodeMetadata(watermarkBytes)
    } catch {
      return null
    }
  }
}
