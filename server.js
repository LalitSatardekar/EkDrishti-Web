import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Server entry point for full-stack deployment on Hostinger and local dev
try {
  const envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath)
    } else {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=')
          const val = rest.join('=').replace(/(^["']|["']$)/g, '').trim()
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = val
          }
        }
      })
    }
  }
} catch (e) {
  console.warn('Could not auto-load .env:', e.message)
}

// Load database connection & model
import { connectToDatabase } from './server_api/lib/db.js'
import User from './server_api/models/User.js'

// Import API route handlers directly
import loginHandler from './server_api/v1/auth/login.js'
import meHandler from './server_api/v1/auth/me.js'
import casesHandler from './server_api/v1/cases.js'
import contactHandler from './server_api/v1/contact.js'
import dashboardHandler from './server_api/v1/dashboard.js'
import healthHandler from './server_api/v1/health.js'
import logsHandler from './server_api/v1/logs.js'
import maintenanceHandler from './server_api/v1/maintenance.js'
import robotsHandler from './server_api/v1/robots.js'
import sitemapHandler from './server_api/v1/sitemap.js'
import uploadHandler from './server_api/v1/upload.js'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.get(['/ping', '/v1/ping', '/api/ping', '/api/v1/ping'], (req, res) => {
  res.json({ success: true, message: 'pong', time: new Date().toISOString() })
})

app.get(['/v1/db-test', '/api/v1/db-test'], async (req, res) => {
  const start = Date.now()
  try {
    const conn = await connectToDatabase()
    const duration = Date.now() - start
    res.json({ success: true, message: 'MongoDB Connected Successfully!', durationMs: duration, readyState: conn.readyState })
  } catch (err) {
    const duration = Date.now() - start
    res.status(500).json({ success: false, error: err.message, stack: err.stack, durationMs: duration })
  }
})

// Set fallback credentials and secrets if not defined in .env
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tanmayjare13_db_user:tanmayjare29@edcluster.g6tbxhr.mongodb.net/ekdrishti?retryWrites=true&w=majority'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ekdrishti_dev_jwt_secret_token_ed_scrl_non'
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'edadmin'
process.env.ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('Ekdrishtiadmin@0112', 10)

// Helper: Ensure default Admin account exists in database
async function bootstrapAdmin() {
  try {
    await connectToDatabase()
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount === 0) {
      await User.create({
        username: process.env.ADMIN_USERNAME,
        password_hash: process.env.ADMIN_PASSWORD_HASH,
        role: 'admin'
      })
      console.log('   ✓ Seeded default admin credentials:')
      console.log(`     Username: ${process.env.ADMIN_USERNAME}`)
    } else {
      console.log('   ✓ Admin account already present.')
    }
  } catch (err) {
    console.warn('⚠️ MongoDB connection/seeding failed:', err.message)
  }
}

// Universal Express Adapter for Serverless Handlers
const adapt = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (err) {
    console.error(`Backend error on ${req.method} ${req.originalUrl}:`, err)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error: ' + err.message })
    }
  }
}

// API Routes (mounted with /v1 and /api/v1 aliases)
app.all(['/health', '/v1/health', '/api/v1/health', '/api/health'], adapt(healthHandler))
app.all(['/v1/auth/login', '/api/v1/auth/login'], adapt(loginHandler))
app.all(['/v1/auth/me', '/api/v1/auth/me'], adapt(meHandler))
app.all(['/v1/cases', '/api/v1/cases', '/api/cases'], adapt(casesHandler))
app.all(['/v1/contact', '/api/v1/contact', '/api/contact'], adapt(contactHandler))
app.all(['/v1/dashboard', '/api/v1/dashboard', '/api/dashboard'], adapt(dashboardHandler))
app.all(['/v1/logs', '/api/v1/logs', '/api/logs'], adapt(logsHandler))
app.all(['/v1/maintenance', '/api/v1/maintenance', '/api/maintenance'], adapt(maintenanceHandler))
app.all(['/v1/robots', '/api/v1/robots', '/api/robots'], adapt(robotsHandler))
app.all(['/v1/sitemap', '/api/v1/sitemap', '/api/sitemap'], adapt(sitemapHandler))
app.all(['/v1/upload', '/api/v1/upload', '/api/upload'], adapt(uploadHandler))

// Serve public and dist static files
const publicPath = path.join(__dirname, 'public')
const distPath = path.join(__dirname, 'dist')
app.use(express.static(publicPath))
app.use(express.static(distPath))

// Client-side routing fallback for React Router SPA
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/v1') || req.path.startsWith('/health')) {
    return next()
  }
  const indexPath = path.join(distPath, 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('EkDrishti Backend running. Build frontend to view site.')
    }
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 EkDrishti server running on port ${PORT} (process.env.PORT = ${process.env.PORT || 'default 3000'})`)
  bootstrapAdmin().catch(e => console.warn('Bootstrap admin warning:', e.message))
})
