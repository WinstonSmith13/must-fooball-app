// server/api/registrations/[id].put.ts
import { defineEventHandler, createError, readBody } from 'h3'
import { getCollection } from '~/server/database'
import {
  registrationUpdateSchema,
  type Registration
} from '~/server/schemas/registration'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  /* 1. Id dans l’URL --------------------------------------------- */
  const id = event.context.params!.id
  const regId = new ObjectId(id)

  /* 2. Payload + validation --------------------------------------- */
  const updatesRaw = await readBody(event)
  const updates    = registrationUpdateSchema.parse(updatesRaw)

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Payload cannot be empty' })
  }

  /* 3. Prépare l’objet $set (convertit les IDs si fournis) -------- */
  const $set: any = { ...updates }
  if (updates.sessionId) $set.sessionId = new ObjectId(updates.sessionId)
  if (updates.playerId)  $set.playerId  = new ObjectId(updates.playerId)

  /* 4. Update atomique ------------------------------------------- */
  const regsCol = await getCollection<Registration>('registrations')

  try {
    const { value: updated } = await regsCol.findOneAndUpdate(
      { _id: regId },
      { $set },
      { returnDocument: 'after' }
    )

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
    }

    /* 5. Normalise les ObjectId en string avant de renvoyer ------- */
    return {
      ...updated,
      _id: id,
      sessionId: (updated.sessionId as any).toString(),
      playerId:  (updated.playerId  as any).toString()
    }
  } catch (err: any) {
    /* Violation d’index unique (sessionId + playerId) */
    if (err?.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Duplicate registration for this session'
      })
    }
    throw err
  }
})
