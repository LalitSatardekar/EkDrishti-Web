import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGODB_URI = process.env.MONGODB_URI
const BACKUP_DIR = path.join(__dirname, '..', 'backups')

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Make sure to run with: node --env-file=.env scripts/db-backup-json.js')
  process.exit(1)
}

async function backup() {
  console.log(`📦 EkDrishti Database Backup Utility`)
  console.log(`Connecting to: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`)

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db()
    console.log(`✅ Connected to database: "${db.databaseName}"`)

    const collections = await db.listCollections().toArray()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupData = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      sourceUri: MONGODB_URI.replace(/:([^@]+)@/, ':****@'),
      collections: {}
    }

    for (const col of collections) {
      if (col.name.startsWith('system.')) continue
      const docs = await db.collection(col.name).find({}).toArray()
      backupData.collections[col.name] = docs
      console.log(` - Collection "${col.name}": ${docs.length} documents`)
    }

    const backupFile = path.join(BACKUP_DIR, `backup_${db.databaseName}_${timestamp}.json`)
    const latestFile = path.join(BACKUP_DIR, `latest-backup.json`)

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8')
    fs.writeFileSync(latestFile, JSON.stringify(backupData, null, 2), 'utf-8')

    console.log(`\n🎉 Backup successfully created:\n   -> ${backupFile}\n   -> ${latestFile}`)
  } catch (err) {
    console.error('❌ Backup failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

backup()
