import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 160 },
  description: { type: String, maxlength: 2000, default: '' },
  image: { type: String, required: true },
  date: { type: String, default: '' },
  location: { type: String, maxlength: 240, default: '' },
  category: { type: String, enum: ['upcoming', 'covered'], required: true },
  layout: { type: String, enum: ['banner', 'square'], default: 'banner' },
  published: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Event || mongoose.model('Event', eventSchema)
