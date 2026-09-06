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
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedMimeTypes.includes(fileType.toLowerCase())) {
    return res.status(400).json({ 
      success: false, 
      message: 'Security error: Only standard images are permitted (JPEG, PNG, WEBP, GIF). SVG/scripts rejected.' 
    })
  }

  // 3. Payload size check (Max 30MB)
  const sizeBytes = (content.length * 3) / 4
  if (sizeBytes > 30 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Security error: Upload capacity exceeds limit of 30MB.' })
  }

  try {
    // 2. Decode Base64 Content
    const base64Data = content.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

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
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
      // Connect AWS Client
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
      
      console.log(`Successfully uploaded ${filename} to AWS S3 bucket: ${AWS_S3_BUCKET}`)
    } else {
      console.warn('AWS S3 credentials not fully configured. Falling back to local public storage mock...')
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Save files to local dev server directory
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
