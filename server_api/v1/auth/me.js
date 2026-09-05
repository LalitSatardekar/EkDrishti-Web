import { requireAuth } from '../../lib/auth.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  return res.status(200).json({
    success: true,
    user: {
      username: req.user.username,
      role: req.user.role
    }
  })
}

export default requireAuth(handler)
