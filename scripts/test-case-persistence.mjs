import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import mongoose from 'mongoose'
import { createBlockInstance, duplicateBlockInstance, updateBlockById } from '../src/lib/caseBlocks.js'
import { normalizeCase } from '../src/lib/config.js'
import { patchTypography } from '../src/lib/caseTypography.js'

// Uses the configured cluster, but creates and removes only a uniquely named QA database.
// Never seed, update, delete, or migrate real case records.
export async function runIsolatedCaseChecks(browserChecks) {
  assert.ok(process.env.MONGODB_URI, 'Run with node --env-file=.env scripts/test-case-persistence.mjs')
  const name = `ekdrishti_cms_qa_${crypto.randomBytes(8).toString('hex')}`
  const originalUri = process.env.MONGODB_URI
  const uri = new URL(originalUri)
  uri.pathname = `/${name}`
  process.env.MONGODB_URI = uri.href
  process.env.NODE_ENV = 'development'
  process.env.AWS_ACCESS_KEY_ID = ''; process.env.AWS_SECRET_ACCESS_KEY = ''; process.env.AWS_S3_BUCKET = ''
  const { connectToDatabase } = await import('../server_api/lib/db.js')
  const { signToken } = await import('../server_api/lib/auth.js')
  const { default: casesHandler } = await import('../server_api/v1/cases.js')
  const { default: meHandler } = await import('../server_api/v1/auth/me.js')
  const { default: uploadHandler } = await import('../server_api/v1/upload.js')
  const { default: Case } = await import('../server_api/models/Case.js')
  let server
  const uploadedPaths = new Set()
  try {
    await connectToDatabase()
    assert.equal(mongoose.connection.name, name, 'Refuse writes unless connected to the dedicated QA database')
    const app = express(); app.use(express.json({ limit: '60mb' }))
    const adapt = handler => async (req, res) => { try { await handler(req, res) } catch { res.status(500).json({ success: false, message: 'QA request failed' }) } }
    app.all('/v1/cases', adapt(casesHandler)); app.all('/v1/auth/me', adapt(meHandler))
    app.all('/v1/upload', (req, res) => {
      const json = res.json.bind(res)
      res.json = body => { if (body.data) for (const value of Object.values(body.data)) if (typeof value === 'string' && value.startsWith('/uploads/')) uploadedPaths.add(value); return json(body) }
      return adapt(uploadHandler)(req, res)
    })
    app.get('/qa-image/:id', (req, res) => {
      const sizes = [[600, 400], [300, 500], [800, 400], [400, 400], [300, 600]]
      const [w, h] = sizes[Number(req.params.id) % sizes.length]
      res.type('svg').send(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#${['456789', '885522', '226655', '663366', '556677'][Number(req.params.id) % 5]}"/><text x="30" y="60" fill="white">QA image ${req.params.id}</text></svg>`)
    })
    server = app.listen(3101, '127.0.0.1')
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
    const base = 'http://127.0.0.1:3101'
    const token = signToken({ username: 'isolated-cms-qa', role: 'admin' })
    const request = async (method, query = '', payload) => {
      const response = await fetch(`${base}/v1/cases${query}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, ...(payload ? { body: JSON.stringify(payload) } : {}), signal: AbortSignal.timeout(20000) })
      const data = await response.json()
      assert.ok(response.ok && data.success, `${method} case request failed: ${data.message || response.status}`)
      return data.data
    }
    const photos = Array.from({ length: 5 }, (_, index) => ({ id: `photo-${index}`, src: `${base}/qa-image/${index}`, alt: `QA photo ${index + 1}`, caption: index === 0 ? 'Image caption' : '', width: [600, 300, 800, 400, 300][index], height: [400, 500, 400, 400, 600][index] }))
    const make = (id, type, title, content = {}, settings) => ({ ...createBlockInstance({ type, title, order: 1, content, settings }), id })
    const sections = [
      make('hero-a', 'Hero', 'Hero A', { images: photos, heading: 'Hero A title', subtitle: 'Hero subtitle', buttonText: 'Contact us', buttonLink: '/contact' }),
      make('hero-b', 'Hero', 'Hero B', { images: photos.slice(1), heading: 'Hero B title' }, { imageLayout: { mode: 'grid', columnsDesktop: 2, columnsTablet: 2, columnsMobile: 1 }, heroMedia: { mode: 'carousel', carousel: { autoplay: false, interval: 9000 } } }),
      make('image-a', 'Image Section', 'Image A', { images: photos, caption: 'Section A caption' }, { imageLayout: { mode: 'grid', columnsDesktop: 2, columnsTablet: 2, columnsMobile: 1 }, carousel: { interval: 2000 } }),
      make('image-b', 'Image Section', 'Image B', { images: photos.slice(1), caption: 'Section B caption' }, { imageLayout: { mode: 'masonry', columnsDesktop: 3, columnsTablet: 2, columnsMobile: 1 }, carousel: { interval: 9000 } }),
      make('gallery-a', 'Gallery', 'Gallery A', { images: photos }, { layout: { mode: 'grid', columns: 2, gap: 12 } }),
      make('gallery-b', 'Gallery', 'Gallery B', { images: photos.slice(2) }, { layout: { mode: 'masonry', columns: 4, gap: 24 } }),
      make('album-a', 'Album Gallery', 'Album A', { images: photos }),
      make('album-b', 'Album Gallery', 'Album B', { images: photos.slice(2) }),
      make('story', 'Rich Text', 'Story', { heading: 'Story heading', text: '<p>Keep <strong>inline formatting</strong> here.</p>' }),
      make('results', 'Results', 'Results', { metric1: 'First metric', metric2: 'Second metric', metric3: 'Third metric' }),
      make('cta', 'CTA', 'CTA', { heading: 'CTA heading', description: 'CTA description', buttonText: 'Get in touch', link: '/contact' }),
      make('quote', 'Testimonial', 'Testimonial', { quote: 'A memorable experience.', author: 'QA client', role: 'QA role' }),
      make('video', 'Video', 'Video', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Video caption' }),
      make('embed', 'Design Embed', 'Design Embed', { url: 'https://www.figma.com/design/nrPSsILSYjesyc5UHjYYa4/QA' }),
      make('downloads', 'Client Access', 'Client Access', { link: 'https://drive.google.com/drive/folders/qa', description: 'Download description', buttonText: 'Download files' })
    ].map((section, index) => ({ ...section, order: index + 1 }))
    let saved = await request('POST', '', { title: 'Isolated CMS QA', slug: 'isolated-cms-qa', category: 'EVENTS', service: 'family-events', status: 'published', image: photos[0].src, hero: photos.slice(0, 2), album: photos, sections })
    let project = normalizeCase(saved)
    const clone = duplicateBlockInstance(project.sections[2], 16)
    clone.content.images[0].focalX = 12
    clone.settings.imageLayout.columnsDesktop = 5
    project.sections = [...project.sections, patchTypography(clone, 'sectionHeading', { fontFamily: 'Inter', fontSizeMobile: '27', color: '#aabbcc' })]
    project.sections = updateBlockById(project.sections, 'image-a', block => patchTypography(block, 'caption', { color: '#ff0000' }))
    saved = await request('PUT', `?id=${saved._id}`, project)
    const reloaded = normalizeCase(await request('GET', `?id=${saved._id}`))
    assert.equal(reloaded.sections.find(section => section.id === 'image-a').settings.imageLayout.columnsDesktop, 2)
    assert.equal(reloaded.sections.find(section => section.id === clone.id).settings.imageLayout.columnsDesktop, 5)
    assert.equal(reloaded.sections.find(section => section.id === clone.id).content.images[0].focalX, 12)
    assert.equal(reloaded.sections.find(section => section.id === 'image-a').content.images[0].focalX, undefined, 'editing the duplicate must not add a focal override to the original')
    assert.equal(reloaded.sections.find(section => section.id === clone.id).settings.typographyOverrides.sectionHeading.fontSizeMobile, '27')
    const stored = await Case.collection.findOne({ _id: new mongoose.Types.ObjectId(saved._id) })
    assert.equal(stored.album[0].src, photos[0].src, 'rich project media must survive Mongoose and MongoDB')
    assert.equal(stored.sections.find(section => section.id === 'image-a').settings.typographyOverrides.caption.color, '#ff0000')
    assert.equal(new Set(stored.sections.map(section => section.id)).size, stored.sections.length)
    console.log('Actual isolated MongoDB POST → PUT → stored document → GET → normalization checks passed.')
    if (browserChecks) await browserChecks({ base, token, project: reloaded, request, photos })
    return { checks: 'passed' }
  } finally {
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === name && /^ekdrishti_cms_qa_[a-f0-9]{16}$/.test(name)) {
      await mongoose.connection.dropDatabase()
      console.log('Removed the temporary QA database; production cases were not touched.')
    }
    await mongoose.disconnect()
    if (server) await new Promise(resolve => server.close(resolve))
    const uploadRoot = path.resolve('public/uploads')
    for (const value of uploadedPaths) { const target = path.resolve('public', `.${value}`); if (target.startsWith(`${uploadRoot}${path.sep}`)) await fs.rm(target, { force: true }) }
    process.env.MONGODB_URI = originalUri
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await runIsolatedCaseChecks()
