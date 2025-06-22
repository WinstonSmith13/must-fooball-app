import { connectToDatabase } from './mongo'
import type { Collection } from 'mongodb'

/** Helper générique → auto-complétion VS Code sur les modèles */
export const getCollection = async <T = unknown>(
  name: string
): Promise<Collection<T>> => {
  const db = await connectToDatabase()
  return db.collection<T>(name)
}

/** Création d’index (à appeler une seule fois) */
export const ensureIndexes = async () => {
  const players   = await getCollection('players')
  const sessions  = await getCollection('sessions')      // ← pluriel
  const regs      = await getCollection('registrations')

  // Index players
  await Promise.all([
    players.createIndex({ email: 1 }, { unique: true, sparse: true }),
    players.createIndex({ phone: 1 }, { unique: true, sparse: true })
  ])

  // Index sessions : un seul créneau par groupe/date/heure
  sessions.createIndex(
    { groupId: 1, sport: 1, date: 1, startTime: 1 },
    { unique: true }
  )

  // Index registrations : un joueur ne peut s’inscrire qu’une fois par session
  await regs.createIndex(
    { sessionId: 1, playerId: 1 },
    { unique: true }
  )

  // (facultatif) pour trier plus vite les lists d’attente
  await regs.createIndex({ sessionId: 1, status: 1, createdAt: 1 })
}

export { connectToDatabase }
