import { connectToDatabase } from './mongo'
import type { Collection } from 'mongodb'

/** Helper générique typé */
export const getCollection = async <T = unknown>(
  name: string
): Promise<Collection<T>> => {
  const db = await connectToDatabase()
  return db.collection<T>(name)
}

/** Création des index : à appeler au boot */
export const ensureIndexes = async () => {
  const players  = await getCollection('players')
  const sessions = await getCollection('sessions')
  const regs     = await getCollection('registrations')

  /* ----------- Players ------------------------------------------ */
  await Promise.all([
    players.createIndex({ email: 1 }, { unique: true, sparse: true }),
    players.createIndex({ phone: 1 }, { unique: true, sparse: true }),
    // rapide recherche par nom
    players.createIndex({ lastName: 1, firstName: 1 })
  ])

  /* ----------- Sessions ----------------------------------------- */
  await sessions.createIndex(                       
    { groupId: 1, sport: 1, date: 1, startTime: 1 },
    { unique: true }
  )
  // pour filtrer rapidement les sessions ouvertes à venir
  await sessions.createIndex({ isClosed: 1, date: 1 })

  /* ----------- Registrations ------------------------------------ */
  await Promise.all([
    // un joueur inscrit une seule fois par session
    regs.createIndex({ sessionId: 1, playerId: 1 }, { unique: true }),
    // promouvoir la plus vieille attente
    regs.createIndex({ sessionId: 1, status: 1, createdAt: 1 })
  ])
}

export { connectToDatabase }
