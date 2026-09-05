import { connectToDatabase } from '../lib/db.js'
import Case from '../models/Case.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    await connectToDatabase()

    // Fetch published projects
    const projects = await Case.find({
      status: 'published',
      deleted_at: { $exists: false }
    }).select('slug updated_at')

    const host = 'https://www.ekdrishti.com'

    // Core static URLs
    const staticUrls = [
      { loc: `${host}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${host}/work`, changefreq: 'daily', priority: '0.9' },
      { loc: `${host}/services`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${host}/about`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${host}/contact`, changefreq: 'monthly', priority: '0.7' }
    ]

    // Compile dynamic project URLs
    const projectUrls = projects.map(project => ({
      loc: `${host}/work/${project.slug}`,
      changefreq: 'weekly',
      priority: '0.6',
      lastmod: project.updated_at ? new Date(project.updated_at).toISOString().split('T')[0] : undefined
    }))

    const allUrls = [...staticUrls, ...projectUrls]

    // Construct XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

    allUrls.forEach(url => {
      xml += `  <url>\n`
      xml += `    <loc>${url.loc}</loc>\n`
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`
      }
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`
      xml += `    <priority>${url.priority}</priority>\n`
      xml += `  </url>\n`
    })

    xml += `</urlset>`

    res.setHeader('Content-Type', 'text/xml')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    return res.status(200).send(xml)
  } catch (error) {
    console.error('Sitemap API Error:', error)
    return res.status(500).json({ success: false, message: 'Sitemap compile failed: ' + error.message })
  }
}
