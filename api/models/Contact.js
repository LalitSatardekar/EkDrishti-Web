import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: String,
  service: String,
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived', 'assigned', 'resolved'],
    default: 'unread'
  },
  // Marketing & acquisition attribution tracking
  utm_source: String,
  utm_medium: String,
  utm_campaign: String,
  utm_term: String,
  utm_content: String,
  landingPage: String,
  referrer: String,
  
  // Security
  ip: String,
  userAgent: String,
  
  // Dates
  created_at: { type: Date, default: Date.now },
  read_at: Date,
  replied_at: Date,
  archived_at: Date,
  resolved_at: Date,
  
  // Soft deletes variables
  deleted_at: Date
})

// Database query optimization indexes
ContactSchema.index({ status: 1, created_at: -1 })
ContactSchema.index({ email: 1 })

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema)
