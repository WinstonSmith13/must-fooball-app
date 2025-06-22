import { connectToDatabase } from '~/server/database/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    
    // Voir les présences existantes
    const presences = await db.collection('presences').find({}).toArray()
    
    // Voir s'il y a des slots
    //const slots = await db.collection('slots').find({}).toArray()
    
    return {
      success: true,
      presences,
      slots,
      totalPresences: presences.length,
      totalSlots: slots.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})
