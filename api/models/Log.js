import mongoose from 'mongoose'

const LogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    default: 'system'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    default: 'N/A'
  },
  outcome: {
    type: String,
    required: true,
    enum: ['success', 'failure']
  },
  details: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    default: 'INFO',
    enum: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
  },
  request_id: String,
  duration: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Prevent recompiling model in serverless hot-reloads
export default mongoose.models.Log || mongoose.model('Log', LogSchema)
