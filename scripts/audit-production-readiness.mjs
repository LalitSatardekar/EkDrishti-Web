import express from 'express'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import healthHandler from '../server_api/v1/health.js'
import casesHandler from '../server_api/v1/cases.js'
import loginHandler from '../server_api/v1/auth/login.js'
import meHandler from '../server_api/v1/auth/me.js'
import { verifyEmailAddress } from '../server_api/lib/emailVerifier.js'
import { connectToDatabase } from '../server_api/lib/db.js'
import Case from '../server_api/models/Case.js'
import Contact from '../server_api/models/Contact.js'
import User from '../server_api/models/User.js'
import Log from '../server_api/models/Log.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// DNS resolution can outlive MongoDB's selection timeout; bound the full audit.
const deadline = setTimeout(() => {
  console.error('Audit exceeded 60 seconds; database connectivity could not be verified.')
  process.exit(1)
}, 60000)
deadline.unref()

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
    addCheck('Cloud Database URI (MongoDB Atlas)', 'PASS', 'MongoDB SRV URI configured (availability not verified)', 'Security & Storage')
  } else if (mongoUri) {
    addCheck('Cloud Database URI (MongoDB Atlas)', 'WARN', 'Using a non-SRV or local MongoDB URI (credentials omitted)', 'Security & Storage')
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

  let databaseConnected = false

  // --- 2. ATLAS DATABASE CONNECTIVITY & DATA HEALTH ---
  console.log('🗄️ [2/5] Testing MongoDB Atlas Live Connection & Collections...')
  try {
    let connectionTimer
    const conn = await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => {
        connectionTimer = setTimeout(() => reject(new Error('Database connection timed out after 8 seconds')), 8000)
      })
    ]).finally(() => clearTimeout(connectionTimer))
    databaseConnected = true
    addCheck('MongoDB Atlas Handshake', 'PASS', `Connected to database "${conn.connection.db.databaseName}" on Atlas`, 'Database')

    const caseCount = await Case.countDocuments()
    const publishedCount = await Case.countDocuments({ status: 'published' })
    const contactCount = await Contact.countDocuments()
    const userCount = await User.countDocuments({ role: 'admin' })
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
  
  // Explicit route map mirrors server.js; no credential or contact writes.
  const routes = {
    '/api/v1/health': healthHandler,
    '/api/v1/cases': casesHandler,
    '/api/v1/auth/login': loginHandler,
    '/api/v1/auth/me': meHandler
  }
  for (const [route, handler] of Object.entries(routes)) {
    app.all(route, async (req, res) => {
      try {
        await handler(req, res)
      } catch {
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Audit route failed' })
      }
    })
  }

  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(15000) })
    const text = await res.text()
    try {
      return { status: res.status, json: JSON.parse(text) }
    } catch {
      return { status: res.status, text }
    }
  }

  try {
    if (databaseConnected) {
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

    } else {
      addCheck('Database-backed API Probes', 'WARN', 'Skipped health and cases probes because database connection failed', 'API & Routing')
    }

    // Invalid payload is rejected before the database or failed-login counters.
    const invalidLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: { $ne: null }, password: [] })
    })
    addCheck('Login Payload Validation', invalidLogin.status === 400 ? 'PASS' : 'FAIL',
      'Expected invalid credential types to return 400; rate-limit enforcement not tested', 'Security & Auth')

    const unauthenticated = await request('/api/v1/auth/me')
    addCheck('Unauthenticated Admin Access', unauthenticated.status === 401 ? 'PASS' : 'FAIL',
      'Expected missing authorization to return 401', 'Security & Auth')

    // Pure validation: no contact record, email, or audit log is created.
    const disposable = await verifyEmailAddress('test@mailinator.com')
    addCheck('Disposable Email Verifier', !disposable.valid ? 'PASS' : 'FAIL',
      'Disposable address validation tested directly; contact submission not tested', 'Anti-Spam & CRM')

  } catch (err) {
    addCheck('API Route Probing', 'FAIL', err.message, 'API & Routing')
  } finally {
    await new Promise(resolve => server.close(resolve))
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

  await Promise.race([mongoose.disconnect(), new Promise(resolve => setTimeout(resolve, 2000))])
  clearTimeout(deadline)
  process.exit(results.failed > 0 ? 1 : 0)
}

runAudit().catch(async () => {
  console.error('Audit aborted unexpectedly; inspect configuration and route imports.')
  await Promise.race([mongoose.disconnect(), new Promise(resolve => setTimeout(resolve, 2000))])
  clearTimeout(deadline)
  process.exit(1)
})
