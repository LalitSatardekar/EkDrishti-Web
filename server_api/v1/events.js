import mongoose from 'mongoose'
import Event from '../models/Event.js'
import { connectToDatabase } from '../lib/db.js'
import { requireAuth } from '../lib/auth.js'
import { validateEvent } from '../lib/eventValidation.js'

async function manage(req, res) {
  const id = req.query.id
  if (req.method !== 'GET' && req.method !== 'POST' && !mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'A valid event ID is required.' })
  let data
  if (['POST', 'PUT'].includes(req.method)) {
    try { data = validateEvent(req.body) } catch (error) { return res.status(400).json({ success: false, message: error.message }) }
  }
  await connectToDatabase()
  if (req.method === 'GET') return res.json({ success: true, data: await Event.find().sort({ date: -1, createdAt: -1 }).lean() })
  if (req.method === 'POST') return res.status(201).json({ success: true, data: await Event.create(data) })
  const event = req.method === 'PUT'
    ? await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    : await Event.findByIdAndDelete(id)
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })
  return res.json({ success: true, data: event })
}

export default async function handler(req, res) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE')
    return res.status(405).json({ success: false, message: 'Method not allowed.' })
  }
  try {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET' || req.query.admin === '1') return await requireAuth(manage)(req, res)
    await connectToDatabase()
    return res.json({ success: true, data: await Event.find({ published: true }).sort({ date: -1, createdAt: -1 }).lean() })
  } catch (error) {
    console.error('Events API:', error)
    return res.status(503).json({ success: false, message: 'Events are temporarily unavailable. Please try again.' })
  }
}
