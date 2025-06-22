import { MongoClient } from 'mongodb'

const config = useRuntimeConfig()
const uri = config.MONGO_URI as string

/** Client unique réutilisé partout (exporté) */
export const mongoClient = new MongoClient(uri)

let _db: Awaited<ReturnType<typeof mongoClient.db>> | null = null

export const connectToDatabase = async () => {
  if (_db) return _db
  await mongoClient.connect()
  _db = mongoClient.db()               // le nom vient de l’URI
  return _db
}
