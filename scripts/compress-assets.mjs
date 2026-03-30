import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SRC_DIR = path.resolve(__dirname, '../src/assets')
const DEST_BASE_DIR = path.resolve(__dirname, '../public/assets')
const DEST_ORIGINAL_ROOT = path.join(DEST_BASE_DIR, 'original')
const DEST_WEBP_ROOT = path.join(DEST_BASE_DIR, 'webp')
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_WIDTH = 2000

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true })

const shouldProcess = async (src, outputs) => {
  try {
    const srcStat = await fs.stat(src)
    const statuses = await Promise.all(outputs.map(async (out) => {
      try {
        const destStat = await fs.stat(out)
        return srcStat.mtimeMs > destStat.mtimeMs
      } catch {
        return true
      }
    }))
    return statuses.some(Boolean)
  } catch {
    return true
  }
}

const processImage = async (srcPath, relPath) => {
  const ext = path.extname(srcPath).toLowerCase()
  if (!IMAGE_EXTS.includes(ext)) return

  const relativeDir = path.dirname(relPath)

  const originalDir = path.join(DEST_ORIGINAL_ROOT, relativeDir)
  const webpDir = path.join(DEST_WEBP_ROOT, relativeDir)
  await Promise.all([ensureDir(originalDir), ensureDir(webpDir)])

  const baseName = path.basename(srcPath, ext)
  const destOriginal = path.join(originalDir, `${baseName}${ext}`)
  const destWebp = path.join(webpDir, `${baseName}.webp`)

  const outputs = [destOriginal, destWebp]
  if (!(await shouldProcess(srcPath, outputs))) return

  const pipeline = sharp(srcPath).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  })

  const jobs = []

  if (ext === '.jpg' || ext === '.jpeg') {
    jobs.push(pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(destOriginal))
  } else if (ext === '.png') {
    jobs.push(pipeline.clone().png({ quality: 80, compressionLevel: 9 }).toFile(destOriginal))
  } else if (ext === '.webp') {
    jobs.push(pipeline.clone().webp({ quality: 78 }).toFile(destOriginal))
  }

  jobs.push(pipeline.clone().webp({ quality: 75 }).toFile(destWebp))

  await Promise.all(jobs)
  console.log(`Optimized: ${relPath}`)
}

const walk = async (dir, parent = '') => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const absPath = path.join(dir, entry.name)
    const relPath = path.join(parent, entry.name)
    if (entry.isDirectory()) {
      await walk(absPath, relPath)
    } else {
      await processImage(absPath, relPath)
    }
  }))
}

const run = async () => {
  console.time('asset-compress')
  await Promise.all([ensureDir(DEST_ORIGINAL_ROOT), ensureDir(DEST_WEBP_ROOT)])
  await walk(SRC_DIR)
  console.timeEnd('asset-compress')
}

run().catch((err) => {
  console.error('Asset compression failed:', err)
  process.exit(1)
})
