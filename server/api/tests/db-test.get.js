import { connectToDatabase } from '~/server/database/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    
    // Lister les collections
    const collections = await db.listCollections().toArray()
    
    // Compter les documents dans chaque collection
    const stats = {}
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      stats[col.name] = count
    }
    
    return {
      success: true,
      database: db.databaseName,
      collections: stats
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})
