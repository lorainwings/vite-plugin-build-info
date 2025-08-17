import type { IndexHtmlTransformContext } from 'vite'
import { generateMetadata } from './metadata'
import { injectIntoHtml, injectWatermarkScript } from './injector'
import type { ReleaseInfoOptions } from './types'

export * from './types'

export default function releaseInfo(options: ReleaseInfoOptions = {}): {
  name: string
  enforce: 'post'
  transformIndexHtml: (
    html: string,
    ctx: IndexHtmlTransformContext
  ) => string | Promise<string>
} {
  const pluginName = 'vite-plugin-release-info'

  return {
    name: pluginName,
    enforce: 'post',

    async transformIndexHtml(html: string, _ctx: IndexHtmlTransformContext) {
      const isProd = process.env.NODE_ENV === 'production'
      const shouldInject = isProd || options.injectInDev === true
      if (!shouldInject) return html

      try {
        const metadata = await generateMetadata(options)

        const htmlWithMetadata = injectIntoHtml(html, metadata, options)

        const htmlWithWatermark = injectWatermarkScript(
          htmlWithMetadata,
          options
        )

        return htmlWithWatermark
      } catch (error) {
        console.warn(`[${pluginName}] Failed to inject metadata:`, error)
        return html
      }
    }
  }
}
