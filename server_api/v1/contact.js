import { connectToDatabase } from '../lib/db.js'
import Contact from '../models/Contact.js'
import { verifyToken } from '../lib/auth.js'
import { logActivity } from '../lib/log.js'
import { sendEmailNotification } from '../lib/email.js'
import { verifyEmailAddress } from '../lib/emailVerifier.js'

export default async function handler(req, res) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'POST':
        return await handlePost(req, res)
      case 'GET':
        return await handleGet(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE'])
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Contact v1 API error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error occurred: ' + error.message })
  }
}

function checkAdminAuth(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  return verifyToken(token)
}

async function handleGet(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { status, search } = req.query

  const filter = {
    deleted_at: { $exists: false }
  }

  if (status) {
    filter.status = status
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { service: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ]
  }

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const total = await Contact.countDocuments(filter)
  const contacts = await Contact.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.status(200).json({
    success: true,
    data: contacts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}

async function handlePut(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ success: false, message: 'Inquiry ID is required' })
  }

  const updateFields = { ...req.body }

  // Track status transitions
  if (req.body.status) {
    const status = req.body.status
    if (status === 'read') updateFields.read_at = new Date()
    if (status === 'replied') updateFields.replied_at = new Date()
    if (status === 'archived') updateFields.archived_at = new Date()
    if (status === 'resolved') updateFields.resolved_at = new Date()
  }

  const updated = await Contact.findByIdAndUpdate(id, updateFields, { returnDocument: 'after', runValidators: true })
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' })
  }

  await logActivity(auth.username, 'update-lead', updated.name, 'success', `Changed status to ${updated.status || 'read'}`)

  return res.status(200).json({ success: true, message: 'Inquiry updated successfully.', data: updated })
}

async function handleDelete(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { id, force } = req.query
  if (!id) {
    return res.status(400).json({ success: false, message: 'Inquiry ID is required' })
  }

  let deleted
  if (force === 'true') {
    deleted = await Contact.findByIdAndDelete(id)
  } else {
    // Soft delete
    deleted = await Contact.findByIdAndUpdate(id, { deleted_at: new Date() }, { returnDocument: 'after' })
  }

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' })
  }

  await logActivity(auth.username, 'delete-lead', deleted.name, 'success', `${force === 'true' ? 'Permanently deleted' : 'Soft deleted'} lead indexed under ${deleted.email}`)

  return res.status(200).json({ success: true, message: 'Inquiry deleted successfully.', data: deleted })
}

async function handlePost(req, res) {
  const {
    name, email, phone, company, service, message,
    honeypot, _website,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    landingPage, referrer
  } = req.body

  // 1. Honeypot check (silently drop bot submissions without writing to DB or emailing)
  if (honeypot || _website) {
    console.warn('Spam submission silently dropped via honeypot trap.')
    return res.status(200).json({
      success: true,
      message: 'Inquiry received. We will get back to you shortly!'
    })
  }

  // 2. Required fields check
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, phone number, and message are required fields.' })
  }

  // 3. Phone number validation (at least 10 digits)
  const trimmedPhone = String(phone || '').trim()
  const phoneDigits = trimmedPhone.replace(/\D/g, '')
  if (!trimmedPhone || phoneDigits.length < 10 || phoneDigits.length > 15) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number with at least 10 digits (e.g. +91 98765 43210).'
    })
  }

  // 4. Robust email verification (Syntax + Disposable + DNS MX check)
  const emailCheck = await verifyEmailAddress(email)
  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      message: emailCheck.reason || 'Please provide a valid email address.'
    })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  // 4. IP Rate Limiting (60 seconds frequency check)
  const recentIp = await Contact.findOne({ ip, created_at: { $gt: new Date(Date.now() - 60000) } })
  if (recentIp) {
    return res.status(429).json({
      success: false,
      message: 'Too many submissions. Please wait 60 seconds before submitting another inquiry.'
    })
  }

  // 5. Duplicate submission checking (5 minutes message duplication check)
  const recentDuplicate = await Contact.findOne({
    email,
    message,
    created_at: { $gt: new Date(Date.now() - 300000) }
  })
  if (recentDuplicate) {
    return res.status(200).json({
      success: true,
      message: 'Inquiry already received. We are processing it!'
    })
  }

  // 6. Create database record first (Database First Principle)
  const newContact = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    company: company ? company.trim() : '',
    service: service || '',
    message: message.trim(),
    status: 'unread',
    ip,
    userAgent: req.headers['user-agent'],
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    landingPage,
    referrer
  })

  // 7. Send notification email via Nodemailer
  const emailResult = await sendEmailNotification({
    name: newContact.name,
    email: newContact.email,
    phone: newContact.phone,
    company: newContact.company,
    service: newContact.service,
    message: newContact.message,
    contactId: newContact._id,
    utm_source,
    landingPage
  })

  // 8. Save audit activity log
  await logActivity('public', 'submit-lead', newContact.name, emailResult.success ? 'success' : 'failure',
    emailResult.success ? `Inquiry saved & email dispatched` : `Inquiry saved but email failed: ${emailResult.error}`
  )

  return res.status(200).json({
    success: true,
    message: 'Thank you! Your inquiry has been received. Our team will get back to you within 24 hours.',
    contactId: newContact._id
  })
}
