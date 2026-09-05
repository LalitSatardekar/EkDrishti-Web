export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  const isProduction = process.env.NODE_ENV === 'production'
  let robotsTxt = ''

  if (isProduction) {
    robotsTxt += `User-agent: *\n`
    robotsTxt += `Allow: /\n`
    robotsTxt += `Disallow: /admin/\n`
    robotsTxt += `Disallow: /api/\n`
    robotsTxt += `\n`
    robotsTxt += `Sitemap: https://www.ekdrishti.com/sitemap.xml\n`
  } else {
    // Disallow crawling dev/staging environments to protect indexing signals
    robotsTxt += `User-agent: *\n`
    robotsTxt += `Disallow: /\n`
  }

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  return res.status(200).send(robotsTxt)
}
