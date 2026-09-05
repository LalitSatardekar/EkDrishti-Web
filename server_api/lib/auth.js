import jwt from 'jsonwebtoken'

function getJwtSecret() {
  return process.env.JWT_SECRET || 'ekdrishti_dev_jwt_secret_token_123'
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch (e) {
    return null
  }
}

// Wrapper to enforce admin authentication
export function requireAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Missing token.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'editor')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' })
    }

    req.user = decoded
    return handler(req, res)
  }
}
