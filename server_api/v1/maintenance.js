import { connectToDatabase } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'
import { logActivity } from '../lib/log.js'
import Case from '../models/Case.js'
import Contact from '../models/Contact.js'
import Log from '../models/Log.js'
import LoginAttempt from '../models/LoginAttempt.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  // 1. Authenticate Request
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const token = authHeader.split(' ')[1]
  const auth = verifyToken(token)
  if (!auth || auth.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin permissions required.' })
  }

  try {
    await connectToDatabase()

    const retentionDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 Days ago

    // 2. Perform Cleanups (Scheduled Maintenance Section 271)
    const logsPurged = await Log.deleteMany({ created_at: { $lt: retentionDate } })
    const casesPurged = await Case.deleteMany({ deleted_at: { $lt: retentionDate } })
    const contactsPurged = await Contact.deleteMany({ deleted_at: { $lt: retentionDate } })
    const lockoutsPurged = await LoginAttempt.deleteMany({ 
      $or: [
        { locked_until: { $lt: new Date() } },
        { created_at: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    })

    const summaryMsg = `Cleared: ${logsPurged.deletedCount} old logs, ${casesPurged.deletedCount} soft-deleted cases, ${contactsPurged.deletedCount} soft-deleted leads, and ${lockoutsPurged.deletedCount} expired lockouts.`
    
    // Log maintenance action in audit logs
    await logActivity(auth.username, 'maintenance-cleanup', 'database', 'success', summaryMsg)

    return res.status(200).json({
      success: true,
      message: 'Maintenance cleanup completed successfully.',
      data: {
        logsPurged: logsPurged.deletedCount,
        casesPurged: casesPurged.deletedCount,
        contactsPurged: contactsPurged.deletedCount,
        lockoutsPurged: lockoutsPurged.deletedCount,
        summary: summaryMsg
      }
    })
  } catch (error) {
    console.error('Maintenance API error:', error)
    return res.status(500).json({ success: false, message: 'Maintenance operations failed: ' + error.message })
  }
}
