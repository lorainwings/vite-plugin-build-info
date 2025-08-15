export interface ReleaseInfoOptions {
  /**
   * 自定义元数据字段
   */
  customFields?: Record<
    string,
    | string
    | number
    | boolean
    | (() => string | number | boolean | Promise<string | number | boolean>)
  >

  /**
   * 是否包含构建时间
   * @default true
   */
  includeBuildTime?: boolean

  /**
   * 是否包含构建版本号
   * @default true
   */
  includeVersion?: boolean

  /**
   * 是否包含 Git 信息
   * @default true
   */
  includeGitInfo?: boolean

  /**
   * 是否包含 Node.js 版本
   * @default true
   */
  includeNodeVersion?: boolean

  /**
   * 是否包含环境变量信息
   * @default false
   */
  includeEnvInfo?: boolean

  /**
   * 要包含的环境变量前缀
   * @default ['NODE_ENV', 'VITE_', 'JENKINS_', 'CI_']
   */
  envPrefixes?: string[]

  /**
   * 注入位置
   * @default 'head'
   */
  injectPosition?: 'head' | 'body' | 'custom'

  /**
   * 自定义注入选择器（当 injectPosition 为 'custom' 时使用）
   */
  customSelector?: string

  /**
   * 是否生成 JSON 格式的元数据
   * @default false
   */
  generateJson?: boolean

  /**
   * 是否生成注释格式的元数据
   * @default true
   */
  generateComments?: boolean

  /**
   * 是否生成 meta 标签
   * @default true
   */
  generateMetaTags?: boolean

  /**
   * 是否生成 console.log 输出
   * @default false
   */
  generateConsoleLog?: boolean

  /**
   * console.log 输出格式
   * @default 'simple'
   */
  consoleLogFormat?: 'structured' | 'simple' | 'detailed'

  /**
   * 是否在 console.log 中使用表情符号
   * @default true
   */
  consoleLogEmojis?: boolean

  /**
   * 元数据变量名（用于在 HTML 中访问）
   * @default '__BUILD_META__'
   */
  variableName?: string

  /**
   * 是否在开发模式下也注入（仅用于调试）
   * @default false
   */
  injectInDev?: boolean
}

export interface BuildMetadata {
  /** ISO 格式构建时间 */
  buildTime: string
  /** 构建时间戳（毫秒） */
  buildTimestamp: number
  /** package.json 版本 */
  version?: string
  /** Git 信息 */
  git?: {
    branch?: string
    commit?: string
    commitHash?: string
    commitMessage?: string
    author?: string
    email?: string
    remote?: string
    tag?: string
    short?: string
    commitTime?: string
    releaseType?: 'branch' | 'tag' | 'commit'
    release?: string
  }
  /** Node 版本 */
  nodeVersion: string
  /** CI 信息（Jenkins/GitHub Actions 等）*/
  ci?: {
    /** Jenkins 容器/节点名 */
    jenkinsNodeName?: string
    /** Jenkins 执行器编号 */
    jenkinsExecutorNumber?: string
    /** Jenkins 构建号 */
    jenkinsBuildNumber?: string
    /** Jenkins 任务名 */
    jenkinsJobName?: string
    /** GitHub Actions 运行 ID */
    githubRunId?: string
    /** GitHub Actions 运行编号 */
    githubRunNumber?: string
    /** CI 提供商名称 */
    provider?: string
    /** CI 容器标识（一般为 HOSTNAME） */
    containerId?: string
  }
  /** 运行环境变量（筛选后的） */
  env?: Record<string, string>
  /** 自定义字段 */
  custom?: Record<string, string | number | boolean>
}

export interface ConsoleLogConfig {
  format: 'structured' | 'simple' | 'detailed'
  useEmojis: boolean
  metadata: BuildMetadata
}
