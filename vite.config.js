import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

function replaceSiteUrl(content, siteUrl) {
  return content.replace(/%VITE_SITE_URL%/g, siteUrl)
}

function pageAliasesPlugin({ siteUrl }) {
  /**
   * Map requested root URLs to files in /pages (source structure),
   * while keeping clean URLs at the site root (/faq, /privacy, /about).
   */
  const aliases = {
    '/faq': 'pages/faq.html',
    '/faq/': 'pages/faq.html',
    '/faq.html': 'pages/faq.html',
    '/privacy': 'pages/privacy.html',
    '/privacy/': 'pages/privacy.html',
    '/privacy.html': 'pages/privacy.html',
    '/about': 'pages/about.html',
    '/about/': 'pages/about.html',
    '/about.html': 'pages/about.html',
    '/robots.txt': 'pages/robots.txt',
    '/sitemap.xml': 'pages/sitemap.xml',
  }

  /** @type {import('vite').ResolvedConfig | undefined} */
  let resolvedConfig

  return {
    name: 'page-aliases',
    apply: 'serve',
    configResolved(config) {
      resolvedConfig = config
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = (req.url || '/').split('?')[0]
        const mapped = aliases[urlPath]
        if (!mapped) return next()

        const rootDir = resolvedConfig?.root ?? process.cwd()
        const absolutePath = path.join(rootDir, mapped)

        try {
          const isHtml = mapped.endsWith('.html')

          if (isHtml) {
            const html = await fs.promises.readFile(absolutePath, 'utf-8')
            const transformed = await server.transformIndexHtml(urlPath, html)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(transformed)
            return
          }

          const raw = await fs.promises.readFile(absolutePath, 'utf-8')
          const content = replaceSiteUrl(raw, siteUrl)
          res.statusCode = 200

          const contentType = urlPath.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8'
          res.setHeader('Content-Type', contentType)
          res.end(content)
        } catch (error) {
          server.config.logger.error(`[page-aliases] ${String(error)}`)
          res.statusCode = 404
          res.end('Not found')
        }
      })
    },
  }
}

function copyPagesToRootPlugin({ siteUrl }) {
  const copies = [
    { from: 'pages/faq.html', to: 'faq.html' },
    { from: 'pages/privacy.html', to: 'privacy.html' },
    { from: 'pages/about.html', to: 'about.html' },
  ]

  const cleanUrlCopies = [
    { from: 'faq.html', to: 'faq/index.html' },
    { from: 'privacy.html', to: 'privacy/index.html' },
    { from: 'about.html', to: 'about/index.html' },
  ]

  const rawCopies = [
    { from: 'pages/robots.txt', to: 'robots.txt' },
    { from: 'pages/sitemap.xml', to: 'sitemap.xml' },
  ]

  /** @type {import('vite').ResolvedConfig | undefined} */
  let resolvedConfig

  return {
    name: 'copy-pages-to-root',
    apply: 'build',
    configResolved(config) {
      resolvedConfig = config
    },
    async writeBundle() {
      const rootDir = resolvedConfig?.root ?? process.cwd()
      const outDir = resolvedConfig?.build?.outDir ?? 'dist'
      const distDir = path.resolve(rootDir, outDir)

      const exists = async (filePath) => {
        try {
          await fs.promises.access(filePath)
          return true
        } catch {
          return false
        }
      }

      await Promise.all(
        copies.map(async ({ from, to }) => {
          const dest = path.join(distDir, to)
          if (await exists(dest)) return

          const src = path.join(distDir, from)
          if (await exists(src)) {
            await fs.promises.copyFile(src, dest)
          }
        })
      )

      await Promise.all(
        cleanUrlCopies.map(async ({ from, to }) => {
          const src = path.join(distDir, from)
          if (!(await exists(src))) return

          const dest = path.join(distDir, to)
          await fs.promises.mkdir(path.dirname(dest), { recursive: true })
          await fs.promises.copyFile(src, dest)
        })
      )

      await Promise.all(
        rawCopies.map(async ({ from, to }) => {
          const src = path.join(rootDir, from)
          const dest = path.join(distDir, to)
          const raw = await fs.promises.readFile(src, 'utf-8')
          const content = replaceSiteUrl(raw, siteUrl)
          await fs.promises.writeFile(dest, content, 'utf-8')
        })
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = String(env.VITE_SITE_URL || '').replace(/\/$/, '')

  return {
    plugins: [pageAliasesPlugin({ siteUrl }), copyPagesToRootPlugin({ siteUrl })],
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(process.cwd(), 'index.html'),
          faq: path.resolve(process.cwd(), 'pages/faq.html'),
          privacy: path.resolve(process.cwd(), 'pages/privacy.html'),
          about: path.resolve(process.cwd(), 'pages/about.html'),
        },
      },
    },
  }
})
