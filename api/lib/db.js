import mongoose from 'mongoose'

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless invocations in production.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env')
  }

  // Production boot diagnostics (Section 326: Fail Fast configuration checks)
  if (process.env.NODE_ENV === 'production') {
    const missingKeys = []
    if (!process.env.JWT_SECRET) missingKeys.push('JWT_SECRET')
    if (!process.env.SMTP_HOST) missingKeys.push('SMTP_HOST')
    if (!process.env.SMTP_PASSWORD) missingKeys.push('SMTP_PASSWORD')
    if (missingKeys.length > 0) {
      throw new Error(`Production boot validation failed. Missing environmental configuration keys: ${missingKeys.join(', ')}`)
    }
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
