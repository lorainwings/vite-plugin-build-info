/**
 * 水印模块入口
 */

import { WatermarkGenerator } from './generator'
import { WatermarkDecoder } from './decoder'
import type { WatermarkOptions, BuildMetadata } from '../types'

export { WatermarkGenerator } from './generator'
export { WatermarkDecoder } from './decoder'
export * from './utils'

// 重新导出类型
export type {
  WatermarkOptions,
  WatermarkData,
  WatermarkError,
  Result,
  ProcessOptions
} from '../types'

/**
 * 创建水印生成器实例
 * @param options - 水印配置选项
 * @returns 水印生成器实例
 */
export function createWatermarkGenerator(
  options?: WatermarkOptions
): WatermarkGenerator {
  return new WatermarkGenerator(options)
}

/**
 * 创建水印解码器实例
 * @returns 水印解码器实例
 */
export function createWatermarkDecoder(): WatermarkDecoder {
  return new WatermarkDecoder()
}

/**
 * 快速生成水印
 * @param metadata - 构建元数据
 * @param options - 水印配置选项
 * @returns 包含水印的 Canvas 元素
 */
export async function generateWatermark(
  metadata: BuildMetadata,
  options?: WatermarkOptions
): Promise<HTMLCanvasElement> {
  const generator = createWatermarkGenerator(options)
  return generator.generate(metadata)
}

/**
 * 快速解码水印
 * @param imageData - 图像数据
 * @returns 解码后的构建元数据
 */
export async function decodeWatermark(
  imageData: ImageData
): Promise<BuildMetadata> {
  const decoder = createWatermarkDecoder()
  return decoder.decode(imageData)
}

/**
 * 检查图像是否包含水印
 * @param imageData - 图像数据
 * @returns 是否包含水印
 */
export function hasWatermark(imageData: ImageData): boolean {
  const decoder = createWatermarkDecoder()
  return decoder.hasWatermark(imageData)
}
