import type { IndexHtmlTransformContext } from 'vite'
import { generateMetadata } from './metadata'
import { injectIntoHtml } from './injector'
import type { Any, ReleaseInfoOptions } from './types'

export * from './types'

export default function releaseInfo(options: ReleaseInfoOptions = {}): Any {
  const pluginName = 'vite-plugin-release-info'

  return {
    name: pluginName,
    enforce: 'pre',

    async transformIndexHtml(html: string, _ctx: IndexHtmlTransformContext) {
      const isProd = process.env.NODE_ENV === 'production'
      const shouldInject = isProd || options.injectInDev === true
      if (!shouldInject) return html
      try {
        const metadata = await generateMetadata(options)
        return injectIntoHtml(html, metadata, options)
      } catch (error) {
        console.warn(`[${pluginName}] Failed to inject metadata:`, error)
        return html
      }
    }
  }
}
