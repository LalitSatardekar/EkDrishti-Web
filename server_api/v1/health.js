import { connectToDatabase } from '../lib/db.js'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  const timestamp = new Date().toISOString()
  const subsystems = {
    database: 'Checking...',
    storage: 'Checking...',
    email: 'Checking...'
  }

  let criticalFailure = false

  try {
    // 1. Verify MongoDB Health
    await connectToDatabase()
    if (mongoose.connection.readyState === 1) {
      subsystems.database = 'Healthy'
    } else {
      subsystems.database = 'Unhealthy'
      criticalFailure = true
    }
  } catch (err) {
    subsystems.database = `Unhealthy (Error: ${err.message})`
    criticalFailure = true
  }

  try {
    // 2. Verify Storage Health (Check if local uploads directory is accessible & writable)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // Check write permissions
    const testFile = path.join(uploadDir, '.health_check_temp')
    fs.writeFileSync(testFile, 'ok')
    fs.unlinkSync(testFile)
    subsystems.storage = 'Healthy'
  } catch (err) {
    subsystems.storage = `Unhealthy (Error: ${err.message})`
    criticalFailure = true
  }

  // 3. Verify Email Configuration Health
  const emailKeyPresent = !!(process.env.SMTP_HOST && process.env.SMTP_PASSWORD)
  subsystems.email = emailKeyPresent ? 'Healthy' : 'Degraded (Mock Mode Active)'

  // Determine overall status
  const overallStatus = criticalFailure 
    ? 'Unhealthy' 
    : subsystems.email.includes('Degraded') 
      ? 'Degraded' 
      : 'Healthy'

  const statusCode = overallStatus === 'Unhealthy' ? 500 : 200

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  return res.status(statusCode).json({
    success: overallStatus !== 'Unhealthy',
    status: overallStatus,
    timestamp,
    subsystems
  })
}
