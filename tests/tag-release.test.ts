import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMetadata } from '../src/metadata'

const mockGit = {
  branch: vi.fn(),
  log: vi.fn(),
  getRemotes: vi.fn(),
  tags: vi.fn(),
  revparse: vi.fn(),
  tag: vi.fn(),
  raw: vi.fn()
}

vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => mockGit)
}))

describe('Tag发布测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 清理可能影响分支/标签检测的CI环境变量，避免CI环境泄漏干扰测试期望
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

    mockGit.log.mockResolvedValue({
      latest: {
        hash: 'def456789abcdef',
        message: 'Release v2.1.0',
        author_name: 'Release Bot',
        author_email: 'release@example.com',
        date: '2024-01-15T10:30:00Z'
      }
    })
    mockGit.getRemotes.mockResolvedValue([
      { refs: { fetch: 'https://github.com/test/repo.git' } }
    ])
    mockGit.tags.mockResolvedValue({ latest: 'v2.1.0' })
    mockGit.raw.mockResolvedValue('2024/0115 10:30:00')
  })

  describe('语义化版本标签发布', () => {
    it('应该正确识别v1.0.0标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v1.0.0')
      mockGit.branch.mockResolvedValue({ current: undefined })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v1.0.0')
      expect(metadata.git?.latestTag).toBe('v2.1.0')
      expect(metadata.git?.commit).toBe('def456789abcdef')
      expect(metadata.git?.short).toBe('def4567')
    })

    it('应该正确识别v2.1.0-beta标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.1.0-beta')
      mockGit.branch.mockResolvedValue({ current: undefined })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v2.1.0-beta')
    })

    it('应该正确识别v3.0.0-alpha.1标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v3.0.0-alpha.1')
      mockGit.branch.mockResolvedValue({ current: undefined })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v3.0.0-alpha.1')
    })
  })

  describe('非语义化标签发布', () => {
    it('应该正确识别release-2024-01标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('release-2024-01')
      mockGit.branch.mockResolvedValue({ current: undefined })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('release-2024-01')
    })

    it('应该正确识别hotfix-bug-123标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('hotfix-bug-123')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('hotfix-bug-123')
    })
  })

  describe('标签发布时的Git信息完整性', () => {
    it('应该包含完整的标签发布信息', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.1.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git).toMatchObject({
        releaseType: 'tag',
        release: 'v2.1.0',
        latestTag: 'v2.1.0',
        commit: 'def456789abcdef',
        commitHash: 'def456789abcdef',
        short: 'def4567',
        commitMessage: 'Release v2.1.0',
        author: 'Release Bot',
        email: 'release@example.com',
        commitTime: expect.any(String),
        remote: 'https://github.com/test/repo.git'
      })
    })

    it('标签发布时应该正确设置commitTime', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.1.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.commitTime).toBeDefined()
      expect(typeof metadata.git?.commitTime).toBe('string')
    })
  })

  describe('标签发布与分支发布的区别', () => {
    it('标签发布时不应该包含分支信息', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.1.0')
      mockGit.branch.mockResolvedValue({ current: 'main' })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v2.1.0')
      expect(metadata.git?.branch).toBe('main')
    })

    it('分支发布时应该正确设置', async () => {
      mockGit.revparse.mockResolvedValue('main')
      mockGit.tag.mockResolvedValue('')
      mockGit.branch.mockResolvedValue({ current: 'main' })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('branch')
      expect(metadata.git?.release).toBe('main')
    })
  })

  describe('标签发布错误处理', () => {
    it('Git命令失败时应该优雅降级', async () => {
      mockGit.revparse.mockRejectedValue(new Error('Git error'))
      mockGit.tag.mockRejectedValue(new Error('Tag error'))
      mockGit.branch.mockResolvedValue({ current: 'main' })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('branch')
      expect(metadata.git?.release).toBe('main')
    })

    it('标签为空字符串时应该回退到commit模式', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('')
      mockGit.branch.mockResolvedValue({ current: 'main' })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('commit')
      expect(metadata.git?.release).toBe('def4567')
    })
  })

  describe('标签发布性能测试', () => {
    it('应该快速处理标签发布', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.1.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.raw.mockResolvedValue('2024/0115 10:30:00')

      const startTime = Date.now()
      const metadata = await generateMetadata({ includeGitInfo: true })
      const endTime = Date.now()

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v2.1.0')
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})
