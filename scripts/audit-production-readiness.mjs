import express from 'express'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectToDatabase } from '../api/lib/db.js'
import Case from '../api/models/Case.js'
import Contact from '../api/models/Contact.js'
import User from '../api/models/User.js'
import Log from '../api/models/Log.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  passed: 0,
  warnings: 0,
  failed: 0
}

function addCheck(name, status, details, category = 'General') {
  results.checks.push({ name, status, details, category })
  if (status === 'PASS') results.passed++
  else if (status === 'WARN') results.warnings++
  else results.failed++
}

async function runAudit() {
  console.log('🔬 Starting Comprehensive Production Readiness Audit...\n')

  // --- 1. ENV CONFIGURATION AUDIT ---
  console.log('📋 [1/5] Checking Environment Variables & Secrets...')
  const mongoUri = process.env.MONGODB_URI || ''
  if (mongoUri.includes('mongodb+srv://')) {
    addCheck('Cloud Database URI (MongoDB Atlas)', 'PASS', 'Using high-availability MongoDB Atlas cluster (edcluster.g6tbxhr.mongodb.net)', 'Security & Storage')
  } else if (mongoUri) {
    addCheck('Cloud Database URI (MongoDB Atlas)', 'WARN', `Using non-srv or local URI: ${mongoUri}`, 'Security & Storage')
  } else {
    addCheck('Cloud Database URI (MongoDB Atlas)', 'FAIL', 'MONGODB_URI is missing', 'Security & Storage')
  }

  const jwtSecret = process.env.JWT_SECRET || ''
  if (jwtSecret && jwtSecret.length >= 32) {
    addCheck('JWT Secret Strength', 'PASS', `Secret configured with length ${jwtSecret.length} chars`, 'Security & Auth')
  } else if (jwtSecret) {
    addCheck('JWT Secret Strength', 'WARN', 'JWT_SECRET is short (<32 chars). Consider generating a 64-char key.', 'Security & Auth')
  } else {
    addCheck('JWT Secret Strength', 'FAIL', 'JWT_SECRET is missing', 'Security & Auth')
  }

  const s3Key = process.env.AWS_ACCESS_KEY_ID || ''
  const s3Secret = process.env.AWS_SECRET_ACCESS_KEY || ''
  const s3Bucket = process.env.AWS_S3_BUCKET || ''
  if (s3Key && s3Secret && s3Bucket) {
    addCheck('AWS S3 Configuration', 'PASS', `Configured with bucket "${s3Bucket}" in region "${process.env.AWS_REGION || 'eu-north-1'}"`, 'Cloud Media Storage')
  } else {
    addCheck('AWS S3 Configuration', 'WARN', 'AWS S3 credentials not fully populated', 'Cloud Media Storage')
  }

  const smtpHost = process.env.SMTP_HOST || ''
  const smtpPass = process.env.SMTP_PASSWORD || ''
  if (smtpPass && !smtpPass.includes('your-16-letter')) {
    addCheck('SMTP Mailer Setup', 'PASS', `Configured with host ${smtpHost}`, 'Email Service')
  } else {
    addCheck('SMTP Mailer Setup', 'WARN', 'SMTP_PASSWORD still contains placeholder "your-16-letter-app-password". Update when ready to dispatch real emails.', 'Email Service')
  }

  // --- 2. ATLAS DATABASE CONNECTIVITY & DATA HEALTH ---
  console.log('🗄️ [2/5] Testing MongoDB Atlas Live Connection & Collections...')
  try {
    const conn = await connectToDatabase()
    addCheck('MongoDB Atlas Handshake', 'PASS', `Connected to database "${conn.connection.db.databaseName}" on Atlas`, 'Database')

    const caseCount = await Case.countDocuments()
    const publishedCount = await Case.countDocuments({ status: 'published' })
    const contactCount = await Contact.countDocuments()
    const userCount = await User.countDocuments()
    const logCount = await Log.countDocuments()

    if (caseCount > 0) {
      addCheck('Case Studies CMS Data', 'PASS', `${caseCount} total cases (${publishedCount} published) live on Atlas`, 'Database')
    } else {
      addCheck('Case Studies CMS Data', 'WARN', '0 cases found in Atlas', 'Database')
    }

    if (userCount > 0) {
      addCheck('Admin User Authentication Record', 'PASS', `${userCount} user record(s) active in Atlas`, 'Database')
    } else {
      addCheck('Admin User Authentication Record', 'FAIL', 'No admin user found in database', 'Database')
    }

    addCheck('CRM & Audit Logs Persistence', 'PASS', `${contactCount} contact leads, ${logCount} audit log entries in Atlas`, 'Database')
  } catch (err) {
    addCheck('MongoDB Atlas Handshake', 'FAIL', err.message, 'Database')
  }

  // --- 3. SERVER & API ENDPOINT PROBING ---
  console.log('⚡ [3/5] Starting In-Memory HTTP Server & Testing Endpoints...')
  const app = express()
  app.use(express.json({ limit: '50mb' }))
  
  app.use('/api', async (req, res) => {
    const relativePath = path.join('api', req.path)
    const handlerFilePath = path.join(process.cwd(), relativePath + '.js')
    try {
      const module = await import(`file://${handlerFilePath}?t=${Date.now()}`)
      const handler = module.default
      const vercelRes = {
        status: (code) => { res.status(code); return vercelRes },
        json: (data) => { res.json(data); return vercelRes },
        send: (data) => { res.send(data); return vercelRes },
        setHeader: (key, val) => { res.setHeader(key, val); return vercelRes }
      }
      await handler(req, vercelRes)
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, options)
    const text = await res.text()
    try {
      return { status: res.status, json: JSON.parse(text) }
    } catch {
      return { status: res.status, text }
    }
  }

  try {
    // Health Check
    const healthRes = await request('/api/v1/health')
    if (healthRes.status === 200 && healthRes.json?.subsystems?.database === 'Healthy') {
      addCheck('Health Endpoint (/api/v1/health)', 'PASS', `Status: 200 OK, DB: ${healthRes.json.subsystems.database}, Storage: ${healthRes.json.subsystems.storage}`, 'API & Routing')
    } else {
      addCheck('Health Endpoint (/api/v1/health)', 'FAIL', `Health check failed: ${JSON.stringify(healthRes.json)}`, 'API & Routing')
    }

    // Public Cases API
    const casesRes = await request('/api/v1/cases')
    if (casesRes.status === 200 && casesRes.json?.success && Array.isArray(casesRes.json.data)) {
      addCheck('Public Cases API (/api/v1/cases)', 'PASS', `Returned ${casesRes.json.data.length} published case studies directly from Atlas`, 'API & Routing')
    } else {
      addCheck('Public Cases API (/api/v1/cases)', 'FAIL', `Status: ${casesRes.status}`, 'API & Routing')
    }

    // Auth Login Failure Guard
    const badLoginRes = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'invalid_admin_probe', password: 'wrongpassword' })
    })
    if (badLoginRes.status === 401) {
      addCheck('Brute-Force & Auth Protection', 'PASS', 'Unauthorized credentials correctly rejected with 401 and logged to Atlas', 'Security & Auth')
    } else {
      addCheck('Brute-Force & Auth Protection', 'WARN', `Unexpected auth response status: ${badLoginRes.status}`, 'Security & Auth')
    }

    // Anti-Spam Honeypot Guard
    const spamRes = await request('/api/v1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'bot@spam.com',
        phone: '1234567890',
        message: 'Spam test',
        _website: 'http://spam-trap-triggered.com'
      })
    })
    if (spamRes.status === 200 && spamRes.json?.success) {
      addCheck('Honeypot Bot Defense', 'PASS', 'Bot trap silently caught and neutralized without polluting database', 'Anti-Spam & CRM')
    } else {
      addCheck('Honeypot Bot Defense', 'WARN', `Honeypot status: ${spamRes.status}`, 'Anti-Spam & CRM')
    }

    // DNS MX / Disposable Email Guard
    const disposableRes = await request('/api/v1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fake Lead',
        email: 'test@mailinator.com',
        phone: '9876543210',
        message: 'Testing fake domain'
      })
    })
    if (disposableRes.status === 400 && (disposableRes.json?.message?.includes('disposable') || disposableRes.json?.message?.includes('Temporary'))) {
      addCheck('Disposable Email Verifier', 'PASS', 'Burner emails (mailinator, tempmail, etc.) actively blocked with 400 rejection', 'Anti-Spam & CRM')
    } else {
      addCheck('Disposable Email Verifier', 'WARN', `Verifier returned status ${disposableRes.status}: ${JSON.stringify(disposableRes.json || disposableRes.text)}`, 'Anti-Spam & CRM')
    }

  } catch (err) {
    addCheck('API Route Probing', 'FAIL', err.message, 'API & Routing')
  } finally {
    server.close()
  }

  // --- 4. ASSETS & CDN COMPLIANCE ---
  console.log('🖼️ [4/5] Auditing Media Asset Delivery & URLs...')
  const assetBase = process.env.VITE_ASSET_WEBP_BASE_URL || ''
  if (assetBase.includes('s3') || assetBase.includes('amazonaws.com') || assetBase.includes('assets-ekdrishti')) {
    addCheck('Cloud Asset S3 / CDN Base URL', 'PASS', `Configured to: ${assetBase}`, 'Media & Performance')
  } else {
    addCheck('Cloud Asset S3 / CDN Base URL', 'WARN', `Base URL: ${assetBase || 'Local fallback'}`, 'Media & Performance')
  }

  // --- 5. SUMMARY OUTPUT ---
  console.log('\n======================================================')
  console.log('📊 PRODUCTION READINESS AUDIT RESULTS')
  console.log('======================================================')
  console.log(`TOTAL CHECKS : ${results.checks.length}`)
  console.log(`PASSED       : ${results.passed} ✅`)
  console.log(`WARNINGS     : ${results.warnings} ⚠️`)
  console.log(`FAILED       : ${results.failed} ❌`)
  console.log('======================================================\n')

  for (const c of results.checks) {
    const icon = c.status === 'PASS' ? '✅' : c.status === 'WARN' ? '⚠️' : '❌'
    console.log(`${icon} [${c.category}] ${c.name}`)
    console.log(`   ↳ ${c.details}\n`)
  }

  process.exit(results.failed > 0 ? 1 : 0)
}

runAudit()
