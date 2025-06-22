import { MongoClient } from 'mongodb'

const config = useRuntimeConfig()
const uri = config.MONGO_URI as string
const client = new MongoClient(uri)

let _db: Awaited<ReturnType<typeof client.db>> | null = null

export const connectToDatabase = async () => {
  if (_db) return _db
  await client.connect()
  _db = client.db() // nom de la DB dans l'URI
  return _db
}
