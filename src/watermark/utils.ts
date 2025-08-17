/**
 * 水印工具函数
 */

import type { WatermarkError, WatermarkOptions, Result, Any } from '../types'

/**
 * 将 HTMLImageElement 转换为 ImageData
 * @param image - HTML 图片元素
 * @returns ImageData 对象
 */
export function imageToImageData(image: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * 将 ImageData 转换为 HTMLCanvasElement
 * @param imageData - ImageData 对象
 * @returns HTMLCanvasElement
 */
export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)

  return canvas
}

/**
 * 计算数据的校验和
 * @param data - 要计算校验和的数据
 * @returns 校验和字符串
 */
export function calculateChecksum(data: Uint8Array): string {
  let hash = 0

  for (let i = 0; i < data.length; i++) {
    const char = data[i]
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为 32 位整数
  }

  return hash.toString(36)
}

/**
 * 验证校验和
 * @param data - 数据
 * @param checksum - 校验和
 * @returns 是否有效
 */
export function validateChecksum(data: Uint8Array, checksum: string): boolean {
  return calculateChecksum(data) === checksum
}

/**
 * 将字符串编码为 Uint8Array
 * @param str - 要编码的字符串
 * @returns Uint8Array
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * 将 Uint8Array 解码为字符串
 * @param data - 要解码的数据
 * @returns 字符串
 */
export function uint8ArrayToString(data: Uint8Array): string {
  return new TextDecoder().decode(data)
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: Any[]) => Any>(
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

/**
 * 创建水印错误
 * @param code - 错误代码
 * @param message - 错误消息
 * @param details - 错误详情
 * @returns WatermarkError
 */
export function createWatermarkError(
  code:
    | 'ENCODE_FAILED'
    | 'DECODE_FAILED'
    | 'VALIDATION_FAILED'
    | 'INVALID_OPTIONS',
  message: string,
  details?: unknown
): WatermarkError {
  const error = new Error(message) as WatermarkError
  error.code = code
  error.details = details
  return error
}

/**
 * 验证水印选项
 * @param options - 水印选项
 * @returns 验证结果
 */
export function validateWatermarkOptions(
  options: Record<string, Any>
): Result<true, WatermarkError> {
  if (
    options.opacity !== undefined &&
    typeof options.opacity === 'number' &&
    (options.opacity < 0 || options.opacity > 1)
  ) {
    return {
      success: false,
      error: createWatermarkError(
        'INVALID_OPTIONS',
        'Opacity must be between 0 and 1',
        { opacity: options.opacity }
      )
    }
  }

  if (
    options.zIndex !== undefined &&
    typeof options.zIndex === 'number' &&
    !Number.isInteger(options.zIndex)
  ) {
    return {
      success: false,
      error: createWatermarkError(
        'INVALID_OPTIONS',
        'zIndex must be an integer',
        { zIndex: options.zIndex }
      )
    }
  }

  return { success: true, data: true }
}

/**
 * 获取默认水印选项
 * @returns 默认选项
 */
export function getDefaultWatermarkOptions(): Required<WatermarkOptions> {
  return {
    enabled: false,
    opacity: 0.1,
    position: 'center',
    size: 'cover',
    zIndex: 9999,
    enableMutationObserver: true,
    enableResizeObserver: true,
    customText: () => '',
    customStyle: {}
  }
}

/**
 * 合并水印选项
 * @param options - 用户选项
 * @returns 合并后的选项
 */
export function mergeWatermarkOptions(
  options?: WatermarkOptions
): Required<WatermarkOptions> {
  const defaults = getDefaultWatermarkOptions()

  if (!options) {
    return defaults
  }

  return {
    ...defaults,
    ...options
  }
}
