import { vi } from 'vitest'

// Mock ImageData
class MockImageData {
  data: Uint8ClampedArray
  width: number
  height: number

  constructor(data: Uint8ClampedArray | number, width?: number, height?: number) {
    if (typeof data === 'number') {
      // 构造函数形式: new ImageData(width, height)
      this.width = data
      this.height = width || data
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      // 构造函数形式: new ImageData(data, width, height)
      this.data = data
      this.width = width || 0
      this.height = height || 0
    }
  }
}

global.ImageData = MockImageData as any

// Mock Canvas API
const mockContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn((x: number, y: number, width: number, height: number) => {
    return new MockImageData(new Uint8ClampedArray(width * height * 4), width, height)
  }),
  putImageData: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  canvas: null as HTMLCanvasElement | null,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arcTo: vi.fn(),
  arc: vi.fn(),
  rect: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  transform: vi.fn(),
  resetTransform: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(() => false),
  isPointInStroke: vi.fn(() => false),
  createImageData: vi.fn((width: number, height: number) => {
    return new MockImageData(width, height)
  }),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  setLineDashOffset: vi.fn(),
  getLineDashOffset: vi.fn(() => 0),
  setLineWidth: vi.fn(),
  getLineWidth: vi.fn(() => 1),
  setLineCap: vi.fn(),
  getLineCap: vi.fn(() => 'butt'),
  setLineJoin: vi.fn(),
  getLineJoin: vi.fn(() => 'miter'),
  setMiterLimit: vi.fn(),
  getMiterLimit: vi.fn(() => 10),
  setFont: vi.fn(),
  getFont: vi.fn(() => '10px sans-serif'),
  setTextAlign: vi.fn(),
  getTextAlign: vi.fn(() => 'start'),
  setTextBaseline: vi.fn(),
  getTextBaseline: vi.fn(() => 'alphabetic'),
  setDirection: vi.fn(),
  getDirection: vi.fn(() => 'inherit'),
  setFillStyle: vi.fn(),
  getFillStyle: vi.fn(() => '#000000'),
  setStrokeStyle: vi.fn(),
  getStrokeStyle: vi.fn(() => '#000000'),
  setShadowBlur: vi.fn(),
  getShadowBlur: vi.fn(() => 0),
  setShadowColor: vi.fn(),
  getShadowColor: vi.fn(() => 'rgba(0, 0, 0, 0)'),
  setShadowOffsetX: vi.fn(),
  getShadowOffsetX: vi.fn(() => 0),
  setShadowOffsetY: vi.fn(),
  getShadowOffsetY: vi.fn(() => 0),
  setImageSmoothingEnabled: vi.fn(),
  getImageSmoothingEnabled: vi.fn(() => true),
  setImageSmoothingQuality: vi.fn(),
  getImageSmoothingQuality: vi.fn(() => 'low')
} as unknown as CanvasRenderingContext2D

// Mock getContext method
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (contextId: string) {
  if (contextId === '2d') {
    return mockContext
  }
  return originalGetContext.call(this, contextId)
}

// Mock Image API
class MockImage extends HTMLImageElement {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 100
  height = 100
  complete = false
  naturalWidth = 100
  naturalHeight = 100
  alt = ''
  crossOrigin: string | null = null
  decoding: 'sync' | 'async' | 'auto' = 'auto'
  loading: 'eager' | 'lazy' = 'eager'
  referrerPolicy = ''
  sizes = ''
  srcset = ''
  useMap = ''
  isMap = false

  constructor() {
    super()
    setTimeout(() => {
      this.complete = true
      this.onload?.()
    }, 0)
  }
}

global.Image = MockImage as any

// Mock FileReader API
class MockFileReader {
  static readonly EMPTY = 0
  static readonly LOADING = 1
  static readonly DONE = 2

  onload: ((event: any) => void) | null = null
  onerror: (() => void) | null = null
  onloadstart: (() => void) | null = null
  onloadend: (() => void) | null = null
  onprogress: ((event: any) => void) | null = null
  onabort: (() => void) | null = null
  readyState = MockFileReader.EMPTY
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null

  readAsDataURL = vi.fn(() => {
    setTimeout(() => {
      this.readyState = MockFileReader.DONE
      this.result =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      this.onload?.({
        target: this
      })
    }, 0)
  })

  readAsText = vi.fn()
  readAsArrayBuffer = vi.fn()
  readAsBinaryString = vi.fn()
  abort = vi.fn()
}

global.FileReader = MockFileReader as any
