import { connectToDatabase } from '../lib/db.js'
import Case from '../models/Case.js'
import { verifyToken } from '../lib/auth.js'
import { logActivity } from '../lib/log.js'

export default async function handler(req, res) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Cases v1 API crash:', error)
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message })
  }
}

function checkAdminAuth(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  return verifyToken(token)
}

async function generateUniqueSlug(baseSlug, id = null) {
  let cleanSlug = baseSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  if (!cleanSlug) cleanSlug = 'untitled-project'

  let uniqueSlug = cleanSlug
  let counter = 1

  while (true) {
    const query = { slug: uniqueSlug }
    if (id) {
      query._id = { $ne: id }
    }
    const existing = await Case.findOne(query)
    if (!existing) {
      return uniqueSlug
    }
    counter++
    uniqueSlug = `${cleanSlug}-${counter}`
  }
}

async function handleGet(req, res) {
  const { slug, id, search, category, featured, status } = req.query
  const auth = checkAdminAuth(req)

  // Standard filter excludes soft-deleted records
  const filter = {
    deleted_at: { $exists: false }
  }

  // 1. Query by ID
  if (id) {
    const project = await Case.findOne({ _id: id, ...filter })
    if (!project) {
      return res.status(404).json({ success: false, message: 'Case study not found or has been deleted.' })
    }
    if (!auth) {
      await Case.findByIdAndUpdate(id, { $inc: { views: 1 } })
    }
    return res.status(200).json({ success: true, data: project })
  }

  // 2. Query by Single Slug
  if (slug) {
    filter.slug = slug
    if (!auth) {
      filter.status = 'published'
    }
    const project = await Case.findOne(filter)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Case study not found' })
    }
    if (!auth && project) {
      await Case.findByIdAndUpdate(project._id, { $inc: { views: 1 } })
    }
    return res.status(200).json({ success: true, data: project })
  }

  // 3. Set standard filters
  if (!auth) {
    filter.status = 'published'
  } else {
    if (status) {
      filter.status = status
    }
  }

  if (category) {
    filter.category = category
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true'
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { service: { $regex: search, $options: 'i' } },
      { client: { $regex: search, $options: 'i' } }
    ]
  }

  // 4. Implement Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const total = await Case.countDocuments(filter)
  const projects = await Case.find(filter)
    .sort({ priority: -1, created_at: -1 })
    .skip(skip)
    .limit(limit)

  return res.status(200).json({
    success: true,
    data: projects,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}

async function handlePost(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { title, service, category } = req.body

  if (!title || !service || !category) {
    return res.status(400).json({ success: false, message: 'Title, service, and category are required' })
  }

  const baseSlug = req.body.slug || title
  const finalSlug = await generateUniqueSlug(baseSlug)

  const payload = {
    ...req.body,
    slug: finalSlug,
    created_at: new Date(),
    updated_at: new Date()
  }

  const project = await Case.create(payload)
  await logActivity(auth.username, 'create-case', title, 'success', `Created case study under slug: /work/${finalSlug}`)

  return res.status(201).json({ success: true, message: 'Case study created successfully.', data: project })
}

async function handlePut(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ success: false, message: 'Project ID is required in query parameters' })
  }

  // Handle optional slug updates (re-validating uniqueness constraints)
  const updatePayload = { ...req.body }
  if (req.body.slug || req.body.title) {
    const baseSlug = req.body.slug || req.body.title
    updatePayload.slug = await generateUniqueSlug(baseSlug, id)
  }

  updatePayload.updated_at = new Date()

  const updatedProject = await Case.findByIdAndUpdate(id, updatePayload, { returnDocument: 'after', runValidators: true })
  if (!updatedProject) {
    return res.status(404).json({ success: false, message: 'Case study not found' })
  }

  await logActivity(auth.username, 'update-case', updatedProject.title, 'success', `Updated sections and metadata properties for project ID: ${id}`)
  return res.status(200).json({ success: true, message: 'Case study updated successfully.', data: updatedProject })
}

async function handleDelete(req, res) {
  const auth = checkAdminAuth(req)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const { id, force } = req.query
  if (!id) {
    return res.status(400).json({ success: false, message: 'Project ID is required in query parameters' })
  }

  let deletedProject
  if (force === 'true') {
    // Permanent deletion
    deletedProject = await Case.findByIdAndDelete(id)
  } else {
    // Soft deletion (Standard enterprise guidelines)
    deletedProject = await Case.findByIdAndUpdate(id, {
      deleted_at: new Date(),
      deleted_by: auth.username
    }, { returnDocument: 'after' })
  }

  if (!deletedProject) {
    return res.status(404).json({ success: false, message: 'Case study not found' })
  }

  await logActivity(auth.username, 'delete-case', deletedProject.title, 'success', `${force === 'true' ? 'Permanently removed' : 'Soft deleted'} case study ID: ${id}`)
  return res.status(200).json({ success: true, message: 'Case study deleted successfully.', data: deletedProject })
}
