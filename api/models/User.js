import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
  created_at: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
