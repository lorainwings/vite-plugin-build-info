import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMetadata } from '../src/metadata'

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

describe('真实Git Tag发布场景测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GitHub Release流程', () => {
    it('应该正确处理GitHub Release标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v1.2.3')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
          message: 'chore: release v1.2.3',
          author_name: 'github-actions[bot]',
          author_email: 'github-actions[bot]@users.noreply.github.com',
          date: '2024-01-20T15:30:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://github.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'v1.2.3' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v1.2.3')
      expect(metadata.git?.commitMessage).toBe('chore: release v1.2.3')
      expect(metadata.git?.author).toBe('github-actions[bot]')
      expect(metadata.git?.remote).toContain('github.com')
    })

    it('应该正确处理预发布标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v2.0.0-rc.1')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'b2c3d4e5f6789012345678901234567890abcde',
          message: 'feat: prepare v2.0.0-rc.1',
          author_name: 'Developer',
          author_email: 'dev@company.com',
          date: '2024-01-21T09:15:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://github.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'v2.0.0-rc.1' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v2.0.0-rc.1')
      expect(metadata.git?.commitMessage).toBe('feat: prepare v2.0.0-rc.1')
    })
  })

  describe('GitLab CI/CD流程', () => {
    it('应该正确处理GitLab标签发布', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v3.1.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'c3d4e5f6789012345678901234567890abcdef',
          message: 'Release v3.1.0',
          author_name: 'GitLab CI',
          author_email: 'gitlab-ci@company.com',
          date: '2024-01-22T14:45:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://gitlab.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'v3.1.0' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('v3.1.0')
      expect(metadata.git?.remote).toContain('gitlab.com')
    })
  })

  describe('企业级发布流程', () => {
    it('应该正确处理企业版本标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('enterprise-v4.5.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'd4e5f6789012345678901234567890abcdef1',
          message: 'feat: enterprise release v4.5.0',
          author_name: 'Release Manager',
          author_email: 'release@enterprise.com',
          date: '2024-01-23T11:20:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'git@internal-git.company.com:enterprise/repo.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'enterprise-v4.5.0' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('enterprise-v4.5.0')
      expect(metadata.git?.remote).toContain('internal-git.company.com')
    })

    it('应该正确处理热修复标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('hotfix-2024-01-23-001')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'e5f6789012345678901234567890abcdef12',
          message: 'fix: critical security patch',
          author_name: 'Security Team',
          author_email: 'security@enterprise.com',
          date: '2024-01-23T16:30:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'git@internal-git.company.com:enterprise/repo.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'hotfix-2024-01-23-001' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('hotfix-2024-01-23-001')
      expect(metadata.git?.commitMessage).toBe('fix: critical security patch')
    })
  })

  describe('多环境发布流程', () => {
    it('应该正确处理开发环境标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('dev-v1.0.0-build.123')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'f6789012345678901234567890abcdef123',
          message: 'build: dev environment v1.0.0',
          author_name: 'CI/CD Pipeline',
          author_email: 'pipeline@company.com',
          date: '2024-01-24T08:00:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://github.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'dev-v1.0.0-build.123' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('dev-v1.0.0-build.123')
    })

    it('应该正确处理生产环境标签', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('prod-v1.0.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: '789012345678901234567890abcdef1234',
          message: 'deploy: production v1.0.0',
          author_name: 'Deployment Bot',
          author_email: 'deploy@company.com',
          date: '2024-01-24T20:00:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://github.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'prod-v1.0.0' })

      const metadata = await generateMetadata({ includeGitInfo: true })

      expect(metadata.git?.releaseType).toBe('tag')
      expect(metadata.git?.release).toBe('prod-v1.0.0')
    })
  })

  describe('标签发布元数据完整性', () => {
    it('应该包含所有必要的标签发布信息', async () => {
      mockGit.revparse.mockResolvedValue('HEAD')
      mockGit.tag.mockResolvedValue('v5.0.0')
      mockGit.branch.mockResolvedValue({ current: undefined })
      mockGit.log.mockResolvedValue({
        latest: {
          hash: '89012345678901234567890abcdef12345',
          message: 'feat: major release v5.0.0',
          author_name: 'Release Engineer',
          author_email: 'release@company.com',
          date: '2024-01-25T10:00:00Z'
        }
      })
      mockGit.getRemotes.mockResolvedValue([
        { refs: { fetch: 'https://github.com/username/repo-name.git' } }
      ])
      mockGit.tags.mockResolvedValue({ latest: 'v5.0.0' })

      const metadata = await generateMetadata({
        includeGitInfo: true,
        includeBuildTime: true,
        includeVersion: true,
        includeNodeVersion: true
      })

      expect(metadata).toMatchObject({
        buildTime: expect.any(String),
        buildTimestamp: expect.any(Number),
        nodeVersion: process.version,
        version: expect.any(String),
        git: {
          releaseType: 'tag',
          release: 'v5.0.0',
          latestTag: 'v5.0.0',
          commit: '89012345678901234567890abcdef12345',
          commitHash: '89012345678901234567890abcdef12345',
          short: '8901234',
          commitMessage: 'feat: major release v5.0.0',
          author: 'Release Engineer',
          email: 'release@company.com',
          commitTime: expect.any(String),
          remote: 'https://github.com/username/repo-name.git'
        }
      })
    })
  })
})
