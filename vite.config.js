import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'blog-server-html',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || !/^\/blogs(?:[/?]|$)/.test(req.url || '')) return next()
        try {
          const response = await fetch('http://127.0.0.1:3001' + req.url, { headers: { 'x-blog-dev': '1' }, redirect: 'manual', signal: AbortSignal.timeout(15000) })
          res.statusCode = response.status
          for (const name of ['location', 'cache-control', 'x-robots-tag']) if (response.headers.has(name)) res.setHeader(name, response.headers.get(name))
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await server.transformIndexHtml(req.url, await response.text()))
        } catch { res.statusCode = 503; res.end('Blog API unavailable. Start npm.cmd run api on port 3001.') }
      })
    }
  }],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: 'Backend server not running' }))
            }
          })
        }
      },
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: 'Backend server not running' }))
            }
          })
        }
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: 'Backend server not running' }))
            }
          })
        }
      }
    }
  },
})
