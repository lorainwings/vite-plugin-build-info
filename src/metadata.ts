import { simpleGit } from 'simple-git'
import type { ReleaseInfoOptions, BuildMetadata } from './types'
import { join } from 'path'
import { readFileSync } from 'fs'

interface GitBranch {
  current?: string
}

interface GitCommit {
  latest?: {
    hash?: string
    message?: string
    author_name?: string
    author_email?: string
    date?: string
  }
}

interface GitRemote {
  refs?: {
    fetch?: string
  }
}

interface GitTags {
  latest?: string
}

interface PackageJson {
  version?: string
}

const getBuildTimeInfo = (): { buildTime: string; buildTimestamp: number } => {
  const now = new Date()
  return {
    buildTime: now.toLocaleString(),
    buildTimestamp: now.getTime()
  }
}

const getNodeVersion = (): string => process.version

const sanitizeBranchName = (name?: string): string | undefined => {
  if (!name) return undefined
  return name
    .replace(/^refs\/heads\//, '')
    .replace(/^refs\/remotes\/origin\//, '')
    .replace(/^origin\//, '')
}

const getBranchFromEnv = (): string | undefined => {
  const candidates = [
    process.env.BRANCH_NAME, // Jenkins Multibranch
    process.env.GIT_LOCAL_BRANCH, // Jenkins Git plugin
    process.env.GIT_BRANCH, // Jenkins（可能为 origin/xxx）
    process.env.CHANGE_BRANCH, // Jenkins PR 分支
    process.env.GITHUB_HEAD_REF, // GitHub Actions PR
    process.env.GITHUB_REF_NAME, // GitHub Actions 分支/标签短名
    process.env.CI_COMMIT_REF_NAME, // GitLab CI 分支/标签名
    process.env.CI_COMMIT_BRANCH, // GitLab CI 分支名
    process.env.CI_BRANCH // 通用 CI
  ]

  for (const raw of candidates) {
    const sanitized = sanitizeBranchName(raw)
    if (sanitized) return sanitized
  }
  return undefined
}

// 纯函数：获取版本信息
const getVersionInfo = async (): Promise<string | undefined> => {
  try {
    const cwd = process.cwd()
    const packagePath = join(cwd, 'package.json')
    const packageContent = readFileSync(packagePath, 'utf-8')
    const packageData: PackageJson = JSON.parse(packageContent)
    return packageData.version
  } catch {
    return '_._._'
  }
}

// 纯函数：获取 Git 信息
const getGitInfo = async (): Promise<BuildMetadata['git'] | undefined> => {
  try {
    const git = simpleGit()
    const [branch, commit, remote, tags] = await Promise.all([
      git.branch().catch(() => ({ current: undefined }) as GitBranch),
      git
        .log({ maxCount: 1 })
        .catch(() => ({ latest: undefined }) as GitCommit),
      git.getRemotes(true).catch(() => [] as GitRemote[]),
      git.tags().catch(() => ({ latest: undefined }) as GitTags)
    ])

    const envBranch = getBranchFromEnv()
    let currentBranch = envBranch ?? branch?.current
    if (currentBranch && /(detached|HEAD|头指针分离)/i.test(currentBranch)) {
      currentBranch = envBranch ?? undefined
    }

    currentBranch = sanitizeBranchName(currentBranch)

    const latestTag = tags?.latest
    const short = commit?.latest?.hash
      ? commit.latest.hash.slice(0, 7)
      : undefined

    let releaseType: 'branch' | 'tag' | 'commit' = 'branch'
    let release: string | undefined = currentBranch

    try {
      const currentRef = await git
        .revparse(['--abbrev-ref', 'HEAD'])
        .catch(() => '')
      const isDetached = currentRef === 'HEAD'

      if (isDetached) {
        const tagAtHead = await git.tag(['--points-at', 'HEAD']).catch(() => '')
        if (tagAtHead) {
          releaseType = 'tag'
          release = tagAtHead
        } else {
          releaseType = 'commit'
          release = short
        }
      } else {
        releaseType = 'branch'
        release = currentBranch
      }
    } catch {
      releaseType = 'branch'
      release = currentBranch
    }

    let commitTime: string | undefined
    if (commit?.latest?.date) {
      const parsed = new Date(commit.latest.date)
      if (!Number.isNaN(parsed.getTime())) {
        commitTime = parsed.toLocaleString()
      }
    }

    if (!commitTime) {
      try {
        const fallback = (
          await git
            .raw([
              'log',
              '-1',
              '--format=%cd',
              '--date=format:%Y/%m%d %H:%M:%S'
            ])
            .catch(() => '')
        ).trim()

        if (fallback) {
          const normalized = fallback.replace(' ', 'T')
          const parsed = new Date(normalized)
          commitTime = !Number.isNaN(parsed.getTime())
            ? parsed.toLocaleString()
            : fallback
        }
      } catch {
        commitTime = ''
      }
    }

    return {
      branch: currentBranch,
      commit: commit?.latest?.hash,
      commitHash: commit?.latest?.hash,
      commitMessage: commit?.latest?.message,
      author: commit?.latest?.author_name,
      email: commit?.latest?.author_email,
      remote: remote[0]?.refs?.fetch,
      latestTag,
      short,
      commitTime,
      releaseType,
      release
    }
  } catch {
    return undefined
  }
}

// 纯函数：获取 CI 信息
const getCiInfo = (): BuildMetadata['ci'] | undefined => {
  const jenkinsNodeName = process.env.JENKINS_NODE_NAME
  const jenkinsExecutorNumber = process.env.EXECUTOR_NUMBER
  const jenkinsBuildNumber = process.env.BUILD_NUMBER
  const jenkinsJobName = process.env.JOB_NAME
  const githubRunId = process.env.GITHUB_RUN_ID
  const githubRunNumber = process.env.GITHUB_RUN_NUMBER
  const containerId = process.env.HOSTNAME

  const provider = process.env.JENKINS_HOME
    ? 'jenkins'
    : process.env.GITHUB_ACTIONS
      ? 'github-actions'
      : process.env.CI
        ? 'generic-ci'
        : undefined

  if (
    jenkinsNodeName ||
    jenkinsExecutorNumber ||
    jenkinsBuildNumber ||
    jenkinsJobName ||
    githubRunId ||
    githubRunNumber ||
    provider ||
    containerId
  ) {
    return {
      jenkinsNodeName,
      jenkinsExecutorNumber,
      jenkinsBuildNumber,
      jenkinsJobName,
      githubRunId,
      githubRunNumber,
      provider,
      containerId
    }
  }

  return undefined
}

// 纯函数：获取环境变量信息
const getEnvironmentInfo = (
  envPrefixes: string[]
): Record<string, string> | undefined => {
  const envInfo: Record<string, string> = {}

  for (const [key, value] of Object.entries(process.env)) {
    if (envPrefixes.some((prefix) => key.startsWith(prefix))) {
      envInfo[key] = value || ''
    }
  }

  return Object.keys(envInfo).length > 0 ? envInfo : undefined
}

// 纯函数：处理自定义字段
const processCustomFields = async (
  customFields: Record<
    string,
    | string
    | number
    | boolean
    | (() => string | number | boolean | Promise<string | number | boolean>)
  >
): Promise<Record<string, string | number | boolean> | undefined> => {
  if (Object.keys(customFields).length === 0) {
    return undefined
  }

  const customInfo: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(customFields)) {
    try {
      if (typeof value === 'function') {
        const resolved = await (
          value as () =>
            | string
            | number
            | boolean
            | Promise<string | number | boolean>
        )()
        customInfo[key] = resolved as string | number | boolean
      } else {
        customInfo[key] = value as string | number | boolean
      }
    } catch (error) {
      console.warn(
        '[@hhfe/vite-plugin-release-info] Failed to get custom field "' +
          key +
          '":',
        error
      )
    }
  }

  return Object.keys(customInfo).length > 0 ? customInfo : undefined
}

// 主函数：生成元数据
export const generateMetadata = async (
  options: ReleaseInfoOptions = {}
): Promise<BuildMetadata> => {
  const {
    customFields = {},
    includeBuildTime = true,
    includeVersion = true,
    includeGitInfo = true,
    includeNodeVersion = true,
    includeEnvInfo = false,
    envPrefixes = ['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_']
  } = options

  // 使用函数组合的方式构建元数据
  const metadata: Partial<BuildMetadata> = {}

  // 构建时间
  if (includeBuildTime) {
    const buildTimeInfo = getBuildTimeInfo()
    metadata.buildTime = buildTimeInfo.buildTime
    metadata.buildTimestamp = buildTimeInfo.buildTimestamp
  }

  // Node.js 版本
  if (includeNodeVersion) {
    metadata.nodeVersion = getNodeVersion()
  }

  // 版本信息
  if (includeVersion) {
    metadata.version = await getVersionInfo()
  }

  // Git 信息
  if (includeGitInfo) {
    metadata.git = await getGitInfo()
  }

  // CI 信息
  metadata.ci = getCiInfo()

  // 环境变量信息
  if (includeEnvInfo) {
    metadata.env = getEnvironmentInfo(envPrefixes)
  }

  // 自定义字段
  metadata.custom = await processCustomFields(customFields)

  return metadata as BuildMetadata
}
