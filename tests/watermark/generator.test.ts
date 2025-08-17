import { describe, it, expect, beforeEach } from 'vitest'
import { WatermarkGenerator } from '../../src/watermark/generator'
import type { BuildMetadata } from '../../src/types'

describe('WatermarkGenerator', () => {
  let generator: WatermarkGenerator
  let mockMetadata: BuildMetadata

  beforeEach(() => {
    generator = new WatermarkGenerator({
      opacity: 0.1,
      position: 'center',
      size: 'cover'
    })

    mockMetadata = {
      buildTime: '2024-01-01T00:00:00.000Z',
      buildTimestamp: 1704067200000,
      version: '1.0.0',
      nodeVersion: '20.0.0',
      git: {
        branch: 'main',
        commit: 'abc123',
        commitHash: 'abc123def456',
        author: 'Test User',
        email: 'test@example.com'
      }
    }
  })

  describe('generate', () => {
    it('should generate watermark canvas with correct dimensions', async () => {
      const canvas = await generator.generate(mockMetadata)

      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })

    it('should apply correct opacity settings', async () => {
      // 测试文本水印画布的透明度设置
      const canvas = generator.createWatermarkCanvas(mockMetadata)
      const ctx = canvas.getContext('2d')

      // 检查 globalAlpha 是否设置正确
      expect(ctx!.globalAlpha).toBe(0.1)
    })

    it('should handle empty metadata gracefully', async () => {
      const emptyMetadata = {
        buildTime: '2024-01-01T00:00:00.000Z',
        buildTimestamp: 1704067200000,
        nodeVersion: '20.0.0'
      }

      const canvas = await generator.generate(emptyMetadata)
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })

    it('should throw error for invalid options', () => {
      expect(() => {
        new WatermarkGenerator({
          opacity: -1 // 无效的透明度值
        })
      }).toThrow('Opacity must be between 0 and 1')
    })
  })

  describe('encodeMetadata', () => {
    it('should encode metadata to binary format', () => {
      const encoded = generator.encodeMetadata({
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: mockMetadata,
        checksum: 'test-checksum'
      })

      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should include checksum in encoded data', () => {
      const encoded = generator.encodeMetadata({
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: mockMetadata,
        checksum: 'test-checksum'
      })

      // 检查是否包含校验和
      const decoder = new TextDecoder()
      const decoded = decoder.decode(encoded)
      expect(decoded).toContain('checksum')
    })
  })

  describe('embedWatermark', () => {
    it('should embed watermark in image data', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 100
      canvas.height = 100
      ctx!.fillStyle = '#ffffff'
      ctx!.fillRect(0, 0, 100, 100)

      const imageData = ctx!.getImageData(0, 0, 100, 100)
      const watermark = new Uint8Array([1, 2, 3, 4])

      const result = generator.embedWatermark(imageData, watermark)

      expect(result).toBeInstanceOf(ImageData)
      expect(result.width).toBe(imageData.width)
      expect(result.height).toBe(imageData.height)
    })

    it('should throw error for image too small', () => {
      const imageData = new ImageData(1, 1) // 1x1 像素，太小
      const watermark = new Uint8Array(1000) // 1000 字节

      expect(() => generator.embedWatermark(imageData, watermark)).toThrow()
    })
  })

  describe('createWatermarkCanvas', () => {
    it('should create watermark canvas with text', () => {
      const canvas = generator.createWatermarkCanvas(mockMetadata)

      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(400)
      expect(canvas.height).toBe(200)
    })

    it('should use custom text when provided', () => {
      const customGenerator = new WatermarkGenerator({
        customText: () => 'Custom Watermark Text'
      })

      const canvas = customGenerator.createWatermarkCanvas(mockMetadata)
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })
  })
})
