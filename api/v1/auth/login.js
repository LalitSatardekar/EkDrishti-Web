import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../../lib/db.js'
import User from '../../models/User.js'
import LoginAttempt from '../../models/LoginAttempt.js'
import { signToken } from '../../lib/auth.js'
import { logActivity } from '../../lib/log.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  const { username, password } = req.body || {}

  // 1. Defend against NoSQL query injections (OWASP Top 10 Injection Mitigation)
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid credentials payload structure.' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  try {
    await connectToDatabase()

    // 2. Check current Brute Force lockout status
    const attempt = await LoginAttempt.findOne({ ip, username })
    if (attempt && attempt.locked_until && attempt.locked_until > new Date()) {
      const lockRemainingMin = Math.ceil((new Date(attempt.locked_until) - new Date()) / 60000)
      return res.status(429).json({ 
        success: false, 
        message: `Too many login attempts. Account locked. Please retry in ${lockRemainingMin} minutes.` 
      })
    }

    let user = await User.findOne({ username })

    // Check bootstrap credentials if not found in database
    if (!user && process.env.ADMIN_USERNAME === username) {
      const hash = process.env.ADMIN_PASSWORD_HASH
      if (hash && bcrypt.compareSync(password, hash)) {
        user = await User.create({
          username,
          password_hash: hash,
          role: 'admin'
        })
      }
    }

    // 3. Handle Credentials Lock and Counter updates
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      let lockedMsg = ''
      
      if (attempt) {
        attempt.attempts += 1
        // Lock account for 15 minutes after 5 consecutive failures
        if (attempt.attempts >= 5) {
          attempt.locked_until = new Date(Date.now() + 15 * 60000)
          lockedMsg = ' Too many attempts. Account locked for 15 minutes.'
        }
        await attempt.save()
      } else {
        await LoginAttempt.create({ ip, username, attempts: 1 })
      }

      // Log audit failed attempt
      await logActivity(username, 'login', 'portal', 'failure', `Failed login attempt. Attempts count: ${attempt ? attempt.attempts : 1}.${lockedMsg}`)
      return res.status(401).json({ success: false, message: `Invalid username or password.${lockedMsg}` })
    }

    // 4. Successful login: reset attempts counter
    if (attempt) {
      await LoginAttempt.deleteOne({ _id: attempt._id })
    }

    const token = signToken({ id: user._id, username: user.username, role: user.role })

    // Log successful login
    await logActivity(user.username, 'login', 'portal', 'success', 'Session token issued')

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login API error:', error)
    return res.status(500).json({ success: false, message: 'An internal server error occurred' })
  }
}
