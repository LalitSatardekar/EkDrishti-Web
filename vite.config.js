import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      // Proxy /api/* to the Vercel dev server during local development.
      // Run `npm run dev:fullstack` (vercel dev) to have the serverless
      // functions available. `vercel dev` uses port 3000 by default, so
      // change the target below if you start it on a different port.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
