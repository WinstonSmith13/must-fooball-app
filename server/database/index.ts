import { connectToDatabase } from "./mongo";
import type { Collection } from "mongodb";

export const getCollection = async <T = unknown>(
  name: string
): Promise<Collection<T>> => {
  const db = await connectToDatabase()
  return db.collection<T>(name)
}

export const ensureIndexes = async () => {
  const players = await getCollection('players')
  await players.createIndex({email:1}, {unique: true, sparse: true})
  await players.createIndex({phone:1}, {unique:true, sparse: true})
}

export { connectToDatabase }
