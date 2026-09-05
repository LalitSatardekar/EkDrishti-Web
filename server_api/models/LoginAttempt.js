import mongoose from 'mongoose'

const LoginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  username: { type: String, required: true },
  attempts: { type: Number, required: true, default: 1 },
  locked_until: Date,
  created_at: { type: Date, default: Date.now, expires: 86400 } // Auto-expire after 24h
})

// Enforce compound uniqueness index to fast queries
LoginAttemptSchema.index({ ip: 1, username: 1 }, { unique: true })

export default mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema)
