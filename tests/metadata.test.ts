import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMetadata } from '../src/metadata'

// Mock simple-git
vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => ({
    branch: vi.fn().mockResolvedValue({ current: 'main' }),
    log: vi.fn().mockResolvedValue({
      latest: {
        hash: 'abc123',
        message: 'test commit',
        author_name: 'Test User',
        author_email: 'test@example.com'
      }
    }),
    getRemotes: vi
      .fn()
      .mockResolvedValue([
        { refs: { fetch: 'https://github.com/test/repo.git' } }
      ]),
    tags: vi.fn().mockResolvedValue({ latest: 'v1.0.0' })
  }))
}))

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate basic metadata', async () => {
    const metadata = await generateMetadata()

    expect(metadata).toHaveProperty('buildTime')
    expect(metadata).toHaveProperty('buildTimestamp')
    expect(metadata).toHaveProperty('nodeVersion')
    expect(metadata.nodeVersion).toBe(process.version)
  })

  it('should include git information when enabled', async () => {
    const metadata = await generateMetadata({ includeGitInfo: true })

    expect(metadata.git).toBeDefined()
    expect(metadata.git?.branch).toBe('main')
    expect(metadata.git?.commit).toBe('abc123')
    expect(metadata.git?.author).toBe('Test User')
  })

  it('should include custom fields', async () => {
    const customFields = {
      testField: 'test value',
      asyncField: async () => 'async value'
    }

    const metadata = await generateMetadata({ customFields })

    expect(metadata.custom).toBeDefined()
    expect(metadata.custom?.testField).toBe('test value')
    expect(metadata.custom?.asyncField).toBe('async value')
  })

  it('should include environment variables when enabled', async () => {
    process.env.TEST_ENV = 'test value'
    process.env.VITE_TEST = 'vite value'

    const metadata = await generateMetadata({
      includeEnvInfo: true,
      envPrefixes: ['TEST_ENV', 'VITE_']
    })

    expect(metadata.env).toBeDefined()
    expect(metadata.env?.TEST_ENV).toBe('test value')
    expect(metadata.env?.VITE_TEST).toBe('vite value')

    delete process.env.TEST_ENV
    delete process.env.VITE_TEST
  })
})
