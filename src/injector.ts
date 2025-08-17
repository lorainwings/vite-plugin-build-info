import type {
  ReleaseInfoOptions,
  BuildMetadata,
  ConsoleLogConfig
} from './types'

// 纯函数：生成 JSON 脚本
const generateJsonScript = (
  metadata: BuildMetadata,
  variableName: string
): string => {
  return `<script>window.${variableName} = ${JSON.stringify(metadata, null, 2)};</script>`
}

// 纯函数：生成注释内容
const generateMetadataComments = (metadata: BuildMetadata): string => {
  const lines = [
    '<!-- Build Metadata -->',
    `<!-- Build Time: ${metadata.buildTime} -->`,
    `<!-- Build Timestamp: ${metadata.buildTimestamp} -->`
  ]

  if (metadata.version) {
    lines.push(`<!-- Version: ${metadata.version} -->`)
  }

  if (metadata.git) {
    if (metadata.git.branch)
      lines.push(`<!-- Git Branch: ${metadata.git.branch} -->`)
    if (metadata.git.commit)
      lines.push(`<!-- Git Commit: ${metadata.git.commit} -->`)
    if (metadata.git.commitTime)
      lines.push(`<!-- Git Commit Time: ${metadata.git.commitTime} -->`)
    if (metadata.git.author)
      lines.push(`<!-- Git Author: ${metadata.git.author} -->`)
    if (metadata.git.latestTag)
      lines.push(`<!-- Git Latest Tag: ${metadata.git.latestTag} -->`)
  }

  lines.push(`<!-- Node Version: ${metadata.nodeVersion} -->`)

  if (metadata.env) {
    Object.entries(metadata.env).forEach(([key, value]) => {
      lines.push(`<!-- Env ${key}: ${value} -->`)
    })
  }

  if (metadata.custom) {
    Object.entries(metadata.custom).forEach(([key, value]) => {
      lines.push(`<!-- Custom ${key}: ${value} -->`)
    })
  }

  return lines.join('\n  ')
}

// 纯函数：生成 meta 标签
const generateMetaTagsHtml = (metadata: BuildMetadata): string => {
  const tags = []

  // 基础信息
  tags.push(`<meta name="build-time" content="${metadata.buildTime}">`)
  tags.push(
    `<meta name="build-timestamp" content="${metadata.buildTimestamp}">`
  )

  if (metadata.version) {
    tags.push(`<meta name="version" content="${metadata.version}">`)
  }

  if (metadata.git) {
    if (metadata.git.branch) {
      tags.push(`<meta name="git-branch" content="${metadata.git.branch}">`)
    }
    if (metadata.git.commit) {
      tags.push(`<meta name="git-commit" content="${metadata.git.commit}">`)
    }
    if (metadata.git.commitTime) {
      tags.push(
        `<meta name="git-commit-time" content="${metadata.git.commitTime}">`
      )
    }
    if (metadata.git.author) {
      tags.push(`<meta name="git-author" content="${metadata.git.author}">`)
    }
    if (metadata.git.latestTag) {
      tags.push(
        `<meta name="git-latest-tag" content="${metadata.git.latestTag}">`
      )
    }
  }

  tags.push(`<meta name="node-version" content="${metadata.nodeVersion}">`)

  // 环境变量
  if (metadata.env) {
    Object.entries(metadata.env).forEach(([key, value]) => {
      tags.push(`<meta name="env-${key.toLowerCase()}" content="${value}">`)
    })
  }

  // 自定义字段
  if (metadata.custom) {
    Object.entries(metadata.custom).forEach(([key, value]) => {
      tags.push(`<meta name="custom-${key.toLowerCase()}" content="${value}">`)
    })
  }

  return tags.join('\n  ')
}

// 纯函数：生成 console.log 脚本
const generateConsoleLogScript = (
  metadata: BuildMetadata,
  format: 'structured' | 'simple' | 'detailed',
  useEmojis: boolean
): string => {
  const logContent = generateConsoleLogContent({ format, useEmojis, metadata })

  return `<script>
${logContent}
  </script>`
}

// 纯函数：生成 console.log 内容
const generateConsoleLogContent = ({
  format,
  useEmojis,
  metadata
}: ConsoleLogConfig): string => {
  switch (format) {
    case 'simple':
      return generateSimpleConsoleLog(metadata, useEmojis)
    case 'detailed':
      return generateDetailedConsoleLog(metadata, useEmojis)
    case 'structured':
    default:
      return generateStructuredConsoleLog(metadata, useEmojis)
  }
}

// 纯函数：生成简单格式的 console.log
const generateSimpleConsoleLog = (
  metadata: BuildMetadata,
  useEmojis: boolean
): string => {
  const lines = [
    `  console.log('%c${useEmojis ? '🚀' : ''} 构建信息', 'color: #1f2937; font-size: 16px; margin-bottom: 12px;');`,
    `  console.log('%c[release] 版本号%c ${metadata.version || 'N/A'}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`,
    `  console.log('%c[release] 构建时间%c ${metadata.buildTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
  ]

  if (metadata.git) {
    if (metadata.git.branch) {
      lines.push(
        `  console.log('%c[release] Git 分支%c ${metadata.git.branch}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commit) {
      lines.push(
        `  console.log('%c[release] Git 提交ID%c ${metadata.git.commit}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commitTime) {
      lines.push(
        `  console.log('%c[release] Git 提交时间%c ${metadata.git.commitTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.latestTag) {
      lines.push(
        `  console.log('%c[release] Git 最新标签%c ${metadata.git.latestTag}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.author) {
      lines.push(
        `  console.log('%c[release] Git 提交人员%c ${metadata.git.author}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
  }

  lines.push(
    `  console.log('%c[release] Node 版本%c ${metadata.nodeVersion}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
  )

  if (metadata.custom) {
    Object.entries(metadata.custom).forEach(([key, value]) => {
      lines.push(
        `  console.log('%c[release] ${key}%c ${value}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    })
  }

  return lines.join('\n')
}

// 纯函数：生成详细格式的 console.log
const generateDetailedConsoleLog = (
  metadata: BuildMetadata,
  useEmojis: boolean
): string => {
  const lines = [
    `  console.group('%c${useEmojis ? '🚀' : ''} 构建信息', 'color: #1f2937; font-size: 18px;');`,
    `  console.log('%c[release] 版本号%c ${metadata.version || 'N/A'}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`,
    `  console.log('%c[release] 构建时间%c ${metadata.buildTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`,
    `  console.log('');`,
    `  console.log('%c⚙️ Git 信息', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
  ]

  if (metadata.git) {
    if (metadata.git.branch) {
      lines.push(
        `    console.log('%c[release] 分支%c ${metadata.git.branch}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commit) {
      lines.push(
        `    console.log('%c[release] 提交ID%c ${metadata.git.commit}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commitTime) {
      lines.push(
        `    console.log('%c[release] 提交时间%c ${metadata.git.commitTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.latestTag) {
      lines.push(
        `    console.log('%c[release] 最新标签%c ${metadata.git.latestTag}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.author) {
      lines.push(
        `    console.log('%c[release] 提交人员%c ${metadata.git.author}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
  }

  lines.push(`  console.log('');`)
  lines.push(
    `  console.log('%c[release] Node 版本%c: ${metadata.nodeVersion}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
  )

  if (metadata.env) {
    lines.push(`  console.log('');`)
    lines.push(
      `  console.log('%c🌐 环境变量', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
    )
    Object.entries(metadata.env).forEach(([key, value]) => {
      lines.push(
        `    console.log('%c[release] ${key}%c: ${value}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    })
  }

  if (metadata.custom) {
    lines.push(`  console.log('');`)
    lines.push(
      `  console.log('%c☰ 自定义字段', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
    )
    Object.entries(metadata.custom).forEach(([key, value]) => {
      lines.push(
        `    console.log('%c[release] ${key}%c: ${value}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    })
  }

  lines.push('  console.groupEnd();')
  return lines.join('\n')
}

// 纯函数：生成结构化格式的 console.log
const generateStructuredConsoleLog = (
  metadata: BuildMetadata,
  useEmojis: boolean
): string => {
  const lines = [
    `  console.group('%c${useEmojis ? '🚀' : ''} 构建信息', 'color: #1f2937; font-size: 18px;');`,
    `  console.log('%c[release] 版本号%c ${metadata.version || 'N/A'}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`,
    `  console.log('%c[release] 构建时间%c ${metadata.buildTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`,
    `  console.log('');`,
    `  console.log('%c⚙️ Git 信息', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
  ]

  if (metadata.git) {
    if (metadata.git.branch) {
      lines.push(
        `    console.log('%c[release] 分支%c ${metadata.git.branch}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commit) {
      lines.push(
        `    console.log('%c[release] 提交ID%c ${metadata.git.commit}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.commitTime) {
      lines.push(
        `    console.log('%c[release] 提交时间%c ${metadata.git.commitTime}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.latestTag) {
      lines.push(
        `    console.log('%c[release] 最新标签%c ${metadata.git.latestTag}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
    if (metadata.git.author) {
      lines.push(
        `    console.log('%c[release] 提交人员%c ${metadata.git.author}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    }
  }

  lines.push(`  console.log('');`)
  lines.push(
    `  console.log('%c[release] Node 版本%c ${metadata.nodeVersion}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
  )
  lines.push(`  console.log('');`)

  if (metadata.env) {
    lines.push(
      `  console.log('%c🌐 环境变量', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
    )
    Object.entries(metadata.env).forEach(([key, value]) => {
      lines.push(
        `    console.log('%c[release] ${key}%c ${value}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    })
    lines.push("  console.log('');")
  }

  if (metadata.custom) {
    lines.push(
      `  console.log('%c☰ 自定义字段', 'color: #1f2937; font-size: 14px; margin: 8px 0 4px 0;');`
    )
    Object.entries(metadata.custom).forEach(([key, value]) => {
      lines.push(
        `    console.log('%c[release] ${key}%c ${value}', 'background: #34495e; color: #ffffff; padding: 5px;', 'background: #42b983; padding:5px; color: #ffffff;');`
      )
    })
  }

  lines.push('  console.groupEnd();')
  return lines.join('\n')
}

// 纯函数：注入脚本到指定位置
const injectScript = (
  html: string,
  script: string,
  position: string,
  customSelector?: string
): string => {
  if (position === 'head') {
    return html.replace('</head>', `  ${script}\n</head>`)
  } else if (position === 'body') {
    return html.replace('</body>', `  ${script}\n</body>`)
  } else if (position === 'custom' && customSelector) {
    const regex = new RegExp(`(${customSelector})`, 'i')
    return html.replace(regex, `$1\n  ${script}`)
  }
  return html
}

// 纯函数：注入注释到指定位置
const injectComments = (
  html: string,
  comments: string,
  position: string,
  customSelector?: string
): string => {
  if (position === 'head') {
    return html.replace('</head>', `  ${comments}\n</head>`)
  } else if (position === 'body') {
    return html.replace('</body>', `  ${comments}\n</body>`)
  } else if (position === 'custom' && customSelector) {
    const regex = new RegExp(`(${customSelector})`, 'i')
    return html.replace(regex, `$1\n  ${comments}`)
  }
  return html
}

// 纯函数：注入 meta 标签到指定位置
const injectMetaTags = (
  html: string,
  metaTags: string,
  position: string,
  customSelector?: string
): string => {
  if (position === 'head') {
    return html.replace('</head>', `  ${metaTags}\n</head>`)
  } else if (position === 'body') {
    return html.replace('</body>', `  ${metaTags}\n</body>`)
  } else if (position === 'custom' && customSelector) {
    const regex = new RegExp(`(${customSelector})`, 'i')
    return html.replace(regex, `$1\n  ${metaTags}`)
  }
  return html
}

// 主函数：注入元数据到 HTML
export const injectIntoHtml = (
  html: string,
  metadata: BuildMetadata,
  options: ReleaseInfoOptions = {}
): string => {
  const {
    injectPosition = 'head',
    customSelector,
    generateJson = false,
    generateComments = true,
    generateMetaTags = true,
    generateConsoleLog = false,
    consoleLogFormat = 'simple',
    consoleLogEmojis = true,
    variableName = '__BUILD_META__'
  } = options

  // 使用函数组合的方式逐步注入内容
  let result = html

  // 生成 JSON 格式的元数据
  if (generateJson) {
    const jsonScript = generateJsonScript(metadata, variableName)
    result = injectScript(result, jsonScript, injectPosition, customSelector)
  }

  // 生成注释格式的元数据
  if (generateComments) {
    const comments = generateMetadataComments(metadata)
    result = injectComments(result, comments, injectPosition, customSelector)
  }

  // 生成 meta 标签
  if (generateMetaTags) {
    const metaTags = generateMetaTagsHtml(metadata)
    result = injectMetaTags(result, metaTags, injectPosition, customSelector)
  }

  // 生成 console.log 输出
  if (generateConsoleLog) {
    const consoleLogScript = generateConsoleLogScript(
      metadata,
      consoleLogFormat,
      consoleLogEmojis
    )
    result = injectScript(
      result,
      consoleLogScript,
      injectPosition,
      customSelector
    )
  }

  return result
}
