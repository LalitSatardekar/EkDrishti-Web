import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/ekdrishti_test'
const ATLAS_URI = process.env.ATLAS_MONGODB_URI || 'mongodb+srv://tanmayjare13_db_user:tanmayjare29@edcluster.g6tbxhr.mongodb.net/ekdrishti?retryWrites=true&w=majority'

const BACKUP_DIR = path.join(__dirname, '..', 'backups')

async function run() {
  console.log('🚀 Starting EkDrishti Backup & Migration to MongoDB Atlas...')

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFilePath = path.join(BACKUP_DIR, `backup_${timestamp}.json`)
  const latestBackupFilePath = path.join(BACKUP_DIR, `latest-backup.json`)

  let localClient
  let atlasClient
  const backupData = {
    createdAt: new Date().toISOString(),
    sourceUri: LOCAL_URI,
    targetUri: ATLAS_URI.replace(/:([^@]+)@/, ':****@'), // masked
    collections: {}
  }

  try {
    // 1. Connect to Local MongoDB
    console.log(`\n📥 [1/4] Connecting to Local MongoDB (${LOCAL_URI})...`)
    localClient = new MongoClient(LOCAL_URI, { directConnection: true, serverSelectionTimeoutMS: 5000 })
    await localClient.connect()
    const localDb = localClient.db()
    console.log(`✅ Connected to local database: "${localDb.databaseName}"`)

    // Get all collections in local DB
    const collectionInfos = await localDb.listCollections().toArray()
    console.log(`📋 Found ${collectionInfos.length} collection(s) locally: ${collectionInfos.map(c => c.name).join(', ') || 'None'}`)

    for (const info of collectionInfos) {
      const colName = info.name
      if (colName.startsWith('system.')) continue

      const docs = await localDb.collection(colName).find({}).toArray()
      backupData.collections[colName] = docs
      console.log(`   - Backed up collection "${colName}": ${docs.length} document(s)`)
    }

    // 2. Save Backup File
    console.log(`\n💾 [2/4] Writing local backup files...`)
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8')
    fs.writeFileSync(latestBackupFilePath, JSON.stringify(backupData, null, 2), 'utf-8')
    console.log(`✅ Backup saved successfully to:\n   -> ${backupFilePath}\n   -> ${latestBackupFilePath}`)

    // 3. Connect to MongoDB Atlas
    console.log(`\n☁️ [3/4] Connecting to MongoDB Atlas Cloud Cluster...`)
    atlasClient = new MongoClient(ATLAS_URI, { serverSelectionTimeoutMS: 15000 })
    await atlasClient.connect()
    const atlasDb = atlasClient.db()
    console.log(`✅ Connected to MongoDB Atlas database: "${atlasDb.databaseName}"`)

    // 4. Migrate Data to Atlas
    console.log(`\n🚚 [4/4] Migrating data into MongoDB Atlas...`)
    const collectionNames = Object.keys(backupData.collections)

    if (collectionNames.length === 0) {
      console.log('⚠️ No local data found to migrate. Creating collections schema placeholder...')
    } else {
      for (const colName of collectionNames) {
        const docs = backupData.collections[colName]
        if (docs.length === 0) {
          console.log(`   - Skipping empty collection "${colName}"`)
          continue
        }

        const atlasCollection = atlasDb.collection(colName)
        
        // Upsert documents to preserve _id and ensure idempotency
        const bulkOps = docs.map(doc => ({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
          }
        }))

        const result = await atlasCollection.bulkWrite(bulkOps)
        console.log(`   ✅ Collection "${colName}": Upserted/Matched ${docs.length} document(s) (upserted: ${result.upsertedCount}, modified: ${result.modifiedCount}, matched: ${result.matchedCount})`)
      }
    }

    // Verification of Counts
    console.log(`\n🔍 Verifying MongoDB Atlas collection counts:`)
    const atlasColInfos = await atlasDb.listCollections().toArray()
    for (const info of atlasColInfos) {
      const count = await atlasDb.collection(info.name).countDocuments()
      console.log(`   - Atlas Collection "${info.name}": ${count} document(s)`)
    }

    console.log(`\n🎉 Migration to MongoDB Atlas completed successfully!`)
  } catch (err) {
    console.error(`\n❌ Error during backup & migration:`, err)
    process.exit(1)
  } finally {
    if (localClient) await localClient.close()
    if (atlasClient) await atlasClient.close()
  }
}

run()
