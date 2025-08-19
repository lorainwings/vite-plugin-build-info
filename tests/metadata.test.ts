import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMetadata } from '../src/metadata'

// Mock simple-git
const mockGit = {
  branch: vi.fn(),
  log: vi.fn(),
  getRemotes: vi.fn(),
  tags: vi.fn(),
  revparse: vi.fn(),
  tag: vi.fn()
}

vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => mockGit)
}))

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 处理可能来自CI环境的分支/标签相关环境变量，避免干扰测试期望
    const envKeys = [
      'BRANCH_NAME',
      'GIT_LOCAL_BRANCH',
      'GIT_BRANCH',
      'CHANGE_BRANCH',
      'GITHUB_HEAD_REF',
      'GITHUB_REF_NAME',
      'CI_COMMIT_REF_NAME',
      'CI_COMMIT_BRANCH',
      'CI_BRANCH'
    ] as const
    for (const key of envKeys) delete process.env[key]

    // 默认模拟分支模式
    mockGit.branch.mockResolvedValue({ current: 'main' })
    mockGit.log.mockResolvedValue({
      latest: {
        hash: 'abc123',
        message: 'test commit',
        author_name: 'Test User',
        author_email: 'test@example.com',
        date: '2024-01-01T00:00:00Z'
      }
    })
    mockGit.getRemotes.mockResolvedValue([
      { refs: { fetch: 'https://github.com/test/repo.git' } }
    ])
    mockGit.tags.mockResolvedValue({ latest: 'v1.0.0' })
    mockGit.revparse.mockResolvedValue('main')
    mockGit.tag.mockResolvedValue('')
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
    expect(metadata.git?.releaseType).toBe('branch')
    expect(metadata.git?.release).toBe('main')
  })

  it('should detect tag-based release', async () => {
    mockGit.revparse.mockResolvedValue('HEAD')
    mockGit.tag.mockResolvedValue('v2.0.0')

    const metadata = await generateMetadata({ includeGitInfo: true })

    expect(metadata.git?.releaseType).toBe('tag')
    expect(metadata.git?.release).toBe('v2.0.0')
  })

  it('should detect commit-based release', async () => {
    mockGit.revparse.mockResolvedValue('HEAD')
    mockGit.tag.mockResolvedValue('')

    const metadata = await generateMetadata({ includeGitInfo: true })

    expect(metadata.git?.releaseType).toBe('commit')
    expect(metadata.git?.release).toBe('abc123')
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
