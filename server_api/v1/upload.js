import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { verifyToken } from '../lib/auth.js'
import { logActivity } from '../lib/log.js'

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1'
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET

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

  const { filename, fileType, content } = req.body
  if (!filename || !fileType || !content) {
    return res.status(400).json({ success: false, message: 'Filename, fileType, and base64 content are required fields.' })
  }

  // 2. MIME Whitelist validations (OWASP Top 10: Secure File Uploads)
  const normalizedType = fileType.toLowerCase()
  const extension = path.extname(filename).toLowerCase()
  const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const fontMimeTypes = ['font/woff2', 'font/woff', 'font/ttf', 'font/otf', 'font/sfnt', 'application/font-woff', 'application/font-sfnt', 'application/x-font-ttf', 'application/x-font-opentype', 'application/octet-stream']
  const fontExtensions = ['.woff2', '.woff', '.ttf', '.otf']
  const isImage = imageMimeTypes.includes(normalizedType)
  const isFont = fontExtensions.includes(extension) && (fontMimeTypes.includes(normalizedType) || !normalizedType)
  if (!isImage && !isFont) {
    return res.status(400).json({ 
      success: false, 
      message: 'Security error: Only standard images or WOFF2, WOFF, TTF, and OTF font files are permitted.'
    })
  }

  // 3. Payload size check (Max 30MB)
  const sizeBytes = (content.length * 3) / 4
  const maximumSize = isFont ? 10 * 1024 * 1024 : 30 * 1024 * 1024
  if (sizeBytes > maximumSize) {
    return res.status(400).json({ success: false, message: `Security error: Upload capacity exceeds limit of ${isFont ? 10 : 30}MB.` })
  }

  try {
    // 2. Decode Base64 Content
    const base64Data = content.replace(/^data:[^;,]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    if (isFont) {
      const signatures = {
        '.woff': buffer.subarray(0, 4).toString('ascii') === 'wOFF',
        '.woff2': buffer.subarray(0, 4).toString('ascii') === 'wOF2',
        '.otf': buffer.subarray(0, 4).toString('ascii') === 'OTTO',
        '.ttf': buffer.subarray(0, 4).equals(Buffer.from([0x00, 0x01, 0x00, 0x00])) || buffer.subarray(0, 4).toString('ascii') === 'true'
      }
      if (!signatures[extension]) return res.status(400).json({ success: false, message: 'The selected file does not contain a valid font signature.' })

      const safeBase = path.basename(filename, extension).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'custom-font'
      const storedFilename = `${safeBase}-${crypto.randomBytes(6).toString('hex')}${extension}`
      let fontUrl = ''
      let uploadedToS3 = false
      if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
        try {
          const s3 = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } })
          await s3.send(new PutObjectCommand({ Bucket: AWS_S3_BUCKET, Key: `fonts/${storedFilename}`, Body: buffer, ContentType: normalizedType || 'application/octet-stream', CacheControl: 'public, max-age=31536000, immutable' }))
          fontUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/fonts/${storedFilename}`
          uploadedToS3 = true
        } catch (s3Err) {
          console.warn('AWS S3 font upload failed, falling back to local public storage:', s3Err.message)
        }
      }
      if (!uploadedToS3) {
        const fontDir = path.join(process.cwd(), 'public', 'uploads', 'fonts')
        fs.mkdirSync(fontDir, { recursive: true })
        fs.writeFileSync(path.join(fontDir, storedFilename), buffer)
        fontUrl = `/uploads/fonts/${storedFilename}`
      }
      await logActivity(auth.username, 'upload-font', filename, 'success', `Custom font uploaded. S3 status: ${uploadedToS3 ? 'Active' : 'Offline'}`)
      return res.status(200).json({ success: true, message: 'Font uploaded successfully.', data: { fontUrl, filename: storedFilename, originalFilename: filename } })
    }

    // 3. Compress & Transform via Sharp (rotate auto-aligns using EXIF, resize caps extreme dimensions at 2560px without enlargement)
    const webpBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer()

    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename
    const webpFilename = `${baseName}.webp`

    let webpUrl = ''
    let originalUrl = ''

    // 4. AWS S3 Upload or Local Mock Upload Fallback
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

        // Upload compressed WebP to S3
        await s3.send(new PutObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: `webp/${webpFilename}`,
          Body: webpBuffer,
          ContentType: 'image/webp'
        }))

        // Upload original file format to S3
        await s3.send(new PutObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: `original/${filename}`,
          Body: buffer,
          ContentType: fileType
        }))

        webpUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/webp/${webpFilename}`
        originalUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/original/${filename}`
        uploadedToS3 = true
        console.log(`Successfully uploaded ${filename} to AWS S3 bucket: ${AWS_S3_BUCKET}`)
      } catch (s3Err) {
        console.warn('AWS S3 upload failed, falling back to local public storage:', s3Err.message)
      }
    }

    if (!uploadedToS3) {
      console.warn('Saving to local storage...')
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Save files to local server directory
      fs.writeFileSync(path.join(uploadDir, webpFilename), webpBuffer)
      fs.writeFileSync(path.join(uploadDir, filename), buffer)

      webpUrl = `/uploads/${webpFilename}`
      originalUrl = `/uploads/${filename}`

      console.log(`Successfully saved ${filename} to local public/uploads directory.`)
    }

    // Audit Log success
    await logActivity(auth.username, 'upload-media', filename, 'success', `Image optimized and saved as WebP format. S3 status: ${AWS_S3_BUCKET ? 'Active' : 'Offline'}`)

    return res.status(200).json({
      success: true,
      message: 'Media uploaded successfully.',
      data: {
        webpUrl,
        originalUrl,
        filename: webpFilename,
        originalFilename: filename
      }
    })
  } catch (error) {
    console.error('API upload handler crash:', error)
    // Audit Log failure
    await logActivity(auth.username, 'upload-media', filename || 'unknown', 'failure', error.message)
    return res.status(500).json({ success: false, message: 'Image compression/upload failed: ' + error.message })
  }
}
