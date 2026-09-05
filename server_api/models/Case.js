import mongoose from 'mongoose'

const SectionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, required: true },
  title: String,
  content: mongoose.Schema.Types.Mixed,
  settings: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
})

const CaseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  client: String,
  service: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: String,
  tags: [String],
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'draft' },
  date: String,
  description: String,
  image: String,
  hero: [mongoose.Schema.Types.Mixed],
  heroSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  album: [String],
  hasVideo: { type: Boolean, default: false },
  youtubeUrl: String,
  video: String,
  height: String,
  results: {
    metric1: String,
    metric2: String,
    metric3: String
  },
  driveLinks: {
    video: String,
    albumGallery: String,
    allFiles: String
  },
  sections: [SectionSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  
  // Soft deletes variables
  deleted_at: Date,
  deleted_by: String,

  // Performance tracking
  views: { type: Number, default: 0 }
})

// Database query optimization indexes
CaseSchema.index({ status: 1, created_at: -1 })
CaseSchema.index({ featured: 1, priority: -1 })

CaseSchema.pre('save', function () {
  this.updated_at = new Date()
})

export default mongoose.models.Case || mongoose.model('Case', CaseSchema)
