import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
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

// Load schemas to perform default seeding
import { connectToDatabase } from './api/lib/db.js'
import User from './api/models/User.js'

const app = express()
app.use(express.json({ limit: '50mb' }))

// Set fallback credentials and secrets if not defined in .env
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ekdrishti_test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ekdrishti_dev_jwt_secret_token_123'
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'edadmin'
// hash for default password: 'Ekdrishtiadmin@0112'
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
      console.log(`     Password: adminpassword123`)
    } else {
      console.log('   ✓ Admin account already present.')
    }
  } catch (err) {
    console.warn('⚠️ MongoDB connection/seeding failed (check if local Mongo is running):', err.message)
  }
}

// Express emulator shortcut for Vercel /health redirect
app.get('/health', async (req, res) => {
  const handlerFilePath = path.join(__dirname, 'api', 'v1', 'health.js')
  try {
    const handlerUrl = pathToFileURL(handlerFilePath).href
    const module = await import(handlerUrl)
    const handler = module.default
    await handler(req, res)
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check error: ' + error.message })
  }
})

// Router routing to Vercel serverless files dynamically
app.use('/api', async (req, res) => {
  // Resolve path from URL /api/v1/auth/login -> api/v1/auth/login.js
  const cleanPath = req.path.replace(/^\//, '')
  const handlerFilePath = path.join(__dirname, 'api', cleanPath + '.js')

  try {
    if (!fs.existsSync(handlerFilePath)) {
      return res.status(404).json({ success: false, message: `API route /api/${cleanPath} not found` })
    }

    const handlerUrl = pathToFileURL(handlerFilePath).href
    const module = await import(handlerUrl)
    const handler = module.default

    // Adapt standard express req/res to Vercel serverless interface
    const vercelReq = req

    const vercelRes = {
      status: (code) => {
        res.status(code)
        return vercelRes
      },
      json: (data) => {
        res.json(data)
        return vercelRes
      },
      send: (data) => {
        res.send(data)
        return vercelRes
      },
      setHeader: (key, val) => {
        res.setHeader(key, val)
        return vercelRes
      }
    }

    await handler(vercelReq, vercelRes)
  } catch (error) {
    console.error(`Backend error on ${req.method} ${req.path}:`, error)
    res.status(500).json({ success: false, message: 'API execution error: ' + error.message })
  }
})

// Serve public and dist static files
const publicPath = path.join(__dirname, 'public')
const distPath = path.join(__dirname, 'dist')
app.use(express.static(publicPath))
app.use(express.static(distPath))

// Client-side routing fallback for React Router (Single Page Application)
app.use((req, res, next) => {
  // If request is not GET or starts with /api or /health, proceed to next
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
    return next()
  }
  const indexPath = path.join(distPath, 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('EkDrishti Backend API running. Run "npm run build" to generate frontend bundle.')
    }
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  console.log(`🚀 EkDrishti server running on port ${PORT}`)
  await bootstrapAdmin()
})
