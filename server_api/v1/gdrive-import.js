import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { verifyToken } from '../lib/auth.js'
import { logActivity } from '../lib/log.js'

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1'
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET
const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY || ''

/**
 * Extracts Google Drive ID from various URL patterns (file or folder)
 */
function extractDriveId(input) {
  if (!input) return null
  const str = input.trim()

  // Match folder ID: drive.google.com/drive/folders/ID or drive.google.com/drive/u/0/folders/ID
  const folderMatch = str.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) return { id: folderMatch[1], type: 'folder' }

  // Match file ID: drive.google.com/file/d/ID or id=ID
  const fileMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || str.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (fileMatch) return { id: fileMatch[1], type: 'file' }

  // Match open?id=ID
  const openMatch = str.match(/open\?id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return { id: openMatch[1], type: 'file' }

  // Direct alphanumeric ID fallback
  if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) {
    return { id: str, type: 'unknown' }
  }

  return null
}

/**
 * Parses multiple Drive URLs/IDs from free text (newlines, commas, or spaces)
 */
function parseMultipleDriveInputs(rawText) {
  if (!rawText) return []
  const tokens = rawText.split(/[\n,;]+/).map(t => t.trim()).filter(Boolean)
  const items = []
  for (const token of tokens) {
    const parsed = extractDriveId(token)
    if (parsed) {
      items.push({ raw: token, ...parsed })
    }
  }
  return items
}

/**
 * Fetch image buffer for a given Google Drive file ID
 */
async function fetchDriveFileBuffer(fileId) {
  // Google direct export / download URLs
  const downloadUrls = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s2560`,
    `https://docs.google.com/uc?export=download&id=${fileId}`
  ]

  let lastError = null
  for (const url of downloadUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'follow'
      })

      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || ''
      // If Google Drive returns HTML (e.g. virus scan warning or login required)
      if (contentType.includes('text/html')) {
        const text = await response.text()
        const confirmMatch = text.match(/confirm=([0-9A-Za-z_-]+)/)
        if (confirmMatch) {
          const confirmRes = await fetch(`https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`, {
            redirect: 'follow'
          })
          if (confirmRes.ok) {
            const arrayBuf = await confirmRes.arrayBuffer()
            return Buffer.from(arrayBuf)
          }
        }
        continue
      }

      const arrayBuf = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuf)
      if (buffer.length > 1000) {
        return buffer
      }
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(`Unable to download Google Drive file [${fileId}]. Ensure folder/file is shared as "Anyone with the link can view". ${lastError ? lastError.message : ''}`)
}

/**
 * Fetch file list from Google Drive folder
 */
async function fetchFolderFiles(folderId, apiKey) {
  if (apiKey) {
    // Query Google Drive v3 API
    const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`)
    const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=files(id,name,mimeType,size)&pageSize=100`
    
    const res = await fetch(apiUrl)
    if (res.ok) {
      const data = await res.json()
      if (data.files && data.files.length > 0) {
        return data.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType }))
      }
    }
  }

  // Fallback: Web fetch publicly shared folder feed
  try {
    const webRes = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await webRes.text()
    
    // Find all file IDs embedded in Drive web UI JSON
    const fileIdMatches = [...html.matchAll(/"([a-zA-Z0-9_-]{25,})"/g)].map(m => m[1])
    const uniqueIds = [...new Set(fileIdMatches)].filter(id => id !== folderId && id.length >= 28 && id.length <= 44)
    
    if (uniqueIds.length > 0) {
      return uniqueIds.slice(0, 50).map((id, index) => ({
        id,
        name: `drive_photo_${index + 1}.jpg`,
        mimeType: 'image/jpeg'
      }))
    }
  } catch (err) {
    console.warn('Public folder scrape warning:', err.message)
  }

  return []
}

/**
 * Save optimized buffer to S3 or local uploads
 */
async function saveOptimizedImage(webpBuffer, originalBuffer, filename) {
  const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
  const webpFilename = `${cleanBase}_${Date.now()}.webp`
  const origFilename = `${cleanBase}_${Date.now()}_orig.jpg`

  let webpUrl = ''
  let originalUrl = ''
  let uploadedToS3 = false

  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
    try {
      const s3 = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
      })

      await s3.send(new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: `webp/${webpFilename}`,
        Body: webpBuffer,
        ContentType: 'image/webp'
      }))

      webpUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/webp/${webpFilename}`
      originalUrl = webpUrl
      uploadedToS3 = true
    } catch (s3Err) {
      console.warn('S3 upload warning in Drive import:', s3Err.message)
    }
  }

  if (!uploadedToS3) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    fs.writeFileSync(path.join(uploadDir, webpFilename), webpBuffer)
    webpUrl = `/uploads/${webpFilename}`
    originalUrl = webpUrl
  }

  return {
    webpUrl,
    originalUrl,
    filename: webpFilename,
    sizeKb: (webpBuffer.length / 1024).toFixed(1)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
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

  const { input, apiKey: userApiKey, maxFiles = 30 } = req.body
  if (!input || !input.trim()) {
    return res.status(400).json({ success: false, message: 'Google Drive folder link or photo URLs are required.' })
  }

  const effectiveApiKey = userApiKey || GOOGLE_DRIVE_API_KEY

  try {
    const parsedItems = parseMultipleDriveInputs(input)
    if (parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract any valid Google Drive link or ID. Please check the URL format.'
      })
    }

    let filesToProcess = []

    // If single folder link provided:
    if (parsedItems.length === 1 && (parsedItems[0].type === 'folder' || parsedItems[0].type === 'unknown')) {
      const folderId = parsedItems[0].id
      const folderFiles = await fetchFolderFiles(folderId, effectiveApiKey)

      if (folderFiles.length > 0) {
        filesToProcess = folderFiles.slice(0, maxFiles)
      } else {
        // Try treating the ID as a direct single file
        filesToProcess = [{ id: folderId, name: 'drive_photo_1.jpg' }]
      }
    } else {
      // Multiple photo links/IDs provided
      filesToProcess = parsedItems.map((item, idx) => ({
        id: item.id,
        name: `drive_photo_${idx + 1}.jpg`
      })).slice(0, maxFiles)
    }

    if (filesToProcess.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No accessible image files found in the provided Google Drive link. Please verify sharing permissions ("Anyone with the link can view").'
      })
    }

    const imported = []
    const errors = []

    // Process files sequentially or in small parallel batches to respect memory
    for (let i = 0; i < filesToProcess.length; i++) {
      const fileInfo = filesToProcess[i]
      try {
        const rawBuffer = await fetchDriveFileBuffer(fileInfo.id)

        // Optimize with Sharp WebP
        const webpBuffer = await sharp(rawBuffer)
          .rotate()
          .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        const saved = await saveOptimizedImage(webpBuffer, rawBuffer, fileInfo.name || `photo_${i + 1}.jpg`)
        imported.push(saved)
      } catch (fileErr) {
        console.warn(`Failed to import Drive photo [${fileInfo.id}]:`, fileErr.message)
        errors.push({ id: fileInfo.id, error: fileErr.message })
      }
    }

    if (imported.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Failed to import images: ${errors.map(e => e.error).join('; ') || 'Google Drive refused download access'}`
      })
    }

    // Log Activity
    await logActivity(
      auth.username,
      'gdrive-import',
      `Imported ${imported.length} photos`,
      'success',
      `Imported ${imported.length} photos from Google Drive.`
    )

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${imported.length} photos from Google Drive.`,
      count: imported.length,
      data: imported,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Google Drive Import API Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to complete Google Drive import: ' + error.message
    })
  }
}
