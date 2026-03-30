/**
 * compress-webp.mjs
 *
 * Converts every image in public/assets/original/ to WebP and writes the
 * result to public/assets/webp/ — preserving the full folder structure.
 *
 * Output naming convention:  <original-filename>.<ext>.webp
 *   e.g.  5N7A5119.JPG  →  5N7A5119.JPG.webp
 *         photo.png      →  photo.png.webp
 *
 * This matches the key structure already in S3 and the toWebpFile() helper
 * used in src/data/cases.js.
 *
 * Usage:
 *   node scripts/compress-webp.mjs          (incremental — skips up-to-date files)
 *   node scripts/compress-webp.mjs --force  (re-processes every file)
 *
 * Requirements:  sharp  (already in devDependencies)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import sharp from 'sharp'

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SRC_DIR   = path.resolve(__dirname, '../src/assets')
const DEST_DIR  = path.resolve(__dirname, '../public/assets/webp')

const IMAGE_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])
const MAX_WIDTH   = 2000   // px — never upscales
const WEBP_QUALITY = 78    // 0-100; 75-82 is the sweet spot for photos

const FORCE = process.argv.includes('--force')

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isImage = (name) => IMAGE_EXTS.has(path.extname(name).toLowerCase())

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true })

/** Returns true when src is newer than dest (or dest doesn't exist). */
const needsUpdate = async (src, dest) => {
  if (FORCE) return true
  try {
    const [s, d] = await Promise.all([fs.stat(src), fs.stat(dest)])
    return s.mtimeMs > d.mtimeMs
  } catch {
    return true // dest doesn't exist yet
  }
}

// ─── Core ─────────────────────────────────────────────────────────────────────

let processed = 0
let skipped   = 0
let errors    = 0

const processImage = async (srcPath, relPath) => {
  const destPath = path.join(DEST_DIR, relPath + '.webp')   // append .webp

  if (!(await needsUpdate(srcPath, destPath))) {
    skipped++
    return
  }

  await ensureDir(path.dirname(destPath))

  try {
    await sharp(srcPath)
      .rotate()                                  // auto-orient from EXIF
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(destPath)

    processed++
    console.log(`  ✓  ${relPath}`)
  } catch (err) {
    errors++
    console.error(`  ✗  ${relPath}\n     ${err.message}`)
  }
}

// ─── Walk ─────────────────────────────────────────────────────────────────────

const walk = async (dir, rel = '') => {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  await Promise.all(
    entries.map((entry) => {
      const abs = path.join(dir, entry.name)
      const relChild = rel ? `${rel}/${entry.name}` : entry.name

      if (entry.isDirectory()) return walk(abs, relChild)
      if (entry.isFile() && isImage(entry.name)) return processImage(abs, relChild)
    })
  )
}

// ─── Entry ───────────────────────────────────────────────────────────────────

console.log(`\nSource : ${SRC_DIR}`)
console.log(`Output : ${DEST_DIR}`)
console.log(`Mode   : ${FORCE ? 'FORCE (re-process all)' : 'incremental (skip up-to-date)'}\n`)

try {
  await fs.access(SRC_DIR)
} catch {
  console.error(`\nERROR: Source folder not found:\n  ${SRC_DIR}\nMake sure src/assets/ exists.\n`)
  process.exit(1)
}

await ensureDir(DEST_DIR)
const start = Date.now()

await walk(SRC_DIR)

const elapsed = ((Date.now() - start) / 1000).toFixed(1)
console.log(`\n─────────────────────────────────────────`)
console.log(`Done in ${elapsed}s  |  processed: ${processed}  skipped: ${skipped}  errors: ${errors}`)
if (errors > 0) console.log(`Check the errors above and re-run to retry.`)
console.log(`─────────────────────────────────────────\n`)
