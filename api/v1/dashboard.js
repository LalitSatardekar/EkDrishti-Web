import fs from 'fs'
import path from 'path'
import { connectToDatabase } from '../lib/db.js'
import Case from '../models/Case.js'
import Contact from '../models/Contact.js'
import Log from '../models/Log.js'
import { verifyToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  // 1. Authenticate Request
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin credentials required.' })
  }

  const token = authHeader.split(' ')[1]
  const auth = verifyToken(token)
  if (!auth) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Session expired.' })
  }

  try {
    await connectToDatabase()

    // 2. Fetch Portfolio metrics (excluding soft deleted cases)
    const activeFilter = { deleted_at: { $exists: false } }
    const totalCases = await Case.countDocuments(activeFilter)
    const publishedCases = await Case.countDocuments({ status: 'published', ...activeFilter })
    const draftCases = await Case.countDocuments({ status: 'draft', ...activeFilter })

    // Calculate total case views dynamically
    const viewsAg = await Case.aggregate([
      { $match: activeFilter },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ])
    const totalViews = viewsAg[0]?.totalViews || 0

    // 3. Fetch Inquiries CRM metrics (excluding soft deleted contacts)
    const contactFilter = { deleted_at: { $exists: false } }
    const totalContacts = await Contact.countDocuments(contactFilter)
    const unreadContacts = await Contact.countDocuments({ status: 'unread', ...contactFilter })
    const readContacts = await Contact.countDocuments({ status: 'read', ...contactFilter })
    const repliedContacts = await Contact.countDocuments({ status: 'replied', ...contactFilter })

    // Calculate Leads comparisons (Today, Yesterday, Weekly, Monthly)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)
    
    const startOf7DaysAgo = new Date(startOfToday)
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7)
    
    const startOf30DaysAgo = new Date(startOfToday)
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30)

    const todayContacts = await Contact.countDocuments({ created_at: { $gte: startOfToday }, ...contactFilter })
    const yesterdayContacts = await Contact.countDocuments({ created_at: { $gte: startOfYesterday, $lt: startOfToday }, ...contactFilter })
    const last7DaysContacts = await Contact.countDocuments({ created_at: { $gte: startOf7DaysAgo }, ...contactFilter })
    const last30DaysContacts = await Contact.countDocuments({ created_at: { $gte: startOf30DaysAgo }, ...contactFilter })

    // 4. File uploads mock statistics
    let mockImagesCount = 0
    let mockImagesSizeMb = 0
    
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir)
        files.forEach(file => {
          const stats = fs.statSync(path.join(uploadDir, file))
          if (stats.isFile()) {
            mockImagesCount++
            mockImagesSizeMb += stats.size
          }
        })
        mockImagesSizeMb = parseFloat((mockImagesSizeMb / (1024 * 1024)).toFixed(2))
      }
    } catch (err) {
      console.warn('Dashboard failed to parse filesystem mock directory sizes:', err.message)
    }

    // 5. Fetch recent records lists for overview lists
    const recentInquiries = await Contact.find(contactFilter)
      .sort({ created_at: -1 })
      .limit(5)

    const recentLogs = await Log.find({})
      .sort({ created_at: -1 })
      .limit(5)

    // 6. Check environmental integrations state
    const s3Enabled = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET)
    const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_PASSWORD)

    return res.status(200).json({
      success: true,
      data: {
        portfolio: {
          total: totalCases,
          published: publishedCases,
          drafts: draftCases,
          totalViews
        },
        crm: {
          total: totalContacts,
          unread: unreadContacts,
          read: readContacts,
          replied: repliedContacts,
          today: todayContacts,
          yesterday: yesterdayContacts,
          last7Days: last7DaysContacts,
          last30Days: last30DaysContacts
        },
        media: {
          count: mockImagesCount,
          sizeMb: mockImagesSizeMb
        },
        integrations: {
          s3: s3Enabled ? 'Active (AWS Bucket)' : 'Offline (Mock mode)',
          email: emailEnabled ? 'Active (Nodemailer SMTP)' : 'Offline (Mock mode)',
          db: 'Connected (Atlas Cluster)'
        },
        recentInquiries,
        recentLogs
      }
    })
  } catch (error) {
    console.error('Dashboard metrics API crash:', error)
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard aggregate metrics: ' + error.message })
  }
}
