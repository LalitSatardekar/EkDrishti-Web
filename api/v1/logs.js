import { connectToDatabase } from '../lib/db.js'
import Log from '../models/Log.js'
import { verifyToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  // 1. Authenticate session
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Credentials missing.' })
  }

  const token = authHeader.split(' ')[1]
  const auth = verifyToken(token)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Session expired.' })
  }

  try {
    await connectToDatabase()

    // 2. Query Pagination Parameters (OWASP/Performance Standards Section 252)
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const skip = (page - 1) * limit

    const total = await Log.countDocuments({})
    const logs = await Log.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)

    return res.status(200).json({ 
      success: true, 
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Logs API crash:', error)
    return res.status(500).json({ success: false, message: 'Failed to retrieve logs details: ' + error.message })
  }
}
