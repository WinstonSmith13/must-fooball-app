import { playerSchema } from '~/server/schemas/player'
import { getCollection } from '~/server/database'
import { validateBody } from '~/server/utils/validate'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const player = await validateBody(event, playerSchema)

  const players = await getCollection<typeof player>('players')
  try {
    const { insertedId } = await players.insertOne(player)
    return { _id: insertedId.toString(), ...player }
  } catch (err: any) {
    if (err.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Duplicate email or phone'
      })
    }
    throw err
  }
})
