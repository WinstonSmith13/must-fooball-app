import { defineEventHandler, createError, readBody } from 'h3'
import { getCollection } from '~/server/database'
import { playerUpdateSchema } from '~/server/schemas/playerUpdate'
import type { Player } from '~/server/schemas/player'
import { ObjectId } from 'mongodb'

export default defineEventHandler (async (event) => {

  const id = event.context.params!.id
  const updatesRaw = await readBody(event)

  // 1. Validation
  const updates = playerUpdateSchema.parse(updatesRaw)

  const players = await getCollection<Player>('players')

  try {
    const { value: updated } = await players.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }      // renvoie le doc mis à jour
    )

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Player not found' })
    }

    // 3. Normaliser _id en string
    return { ...updated, _id: updated._id.toString() }
  } catch (err: any) {
    // Gestion doublons email/phone
    if (err.code === 11000) {
      throw createError({ statusCode: 409, statusMessage: 'Duplicate email or phone' })
    }
    throw err
  }

})
