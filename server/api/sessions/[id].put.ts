import { defineEventHandler, createError, readBody } from 'h3'
import { getCollection } from '~/server/database'
import {
  sessionUpdateSchema,
  type Session
} from '~/server/schemas/session'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  /* ID + payload --------------------------------------------------- */
  const id = event.context.params!.id
  const updatesRaw = await readBody(event)
  const updates    = sessionUpdateSchema.parse(updatesRaw)

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Payload cannot be empty' })
  }

  /* Règles métier --------------------------------------------------- */
  if (updates.capacity !== undefined) {
    if (updates.capacity < 4 || updates.capacity > 40) {
      throw createError({ statusCode: 400, statusMessage: 'Capacity 4–40 only' })
    }
  }
  if (updates.date) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(`${updates.date}T00:00:00`) < today) {
      throw createError({ statusCode: 400, statusMessage: 'Date must be today or later' })
    }
  }

  /* StartTime (quart d’heure + plage 06h-23h) ---------------------- */
  if (updates.startTime) {
    const [hh, mm] = updates.startTime.split(':').map(Number)
    if (hh < 6 || hh > 22 || ![0, 15, 30, 45].includes(mm)) {
      throw createError({ statusCode: 400, statusMessage: 'Start time 06-23h, 00/15/30/45' })
    }
  }

  /* Update ---------------------------------------------------------- */
  const sessionsCol = await getCollection<Session>('sessions')
  try {
    const { value: updated } = await sessionsCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    )

    if (!updated)
      throw createError({ statusCode: 404, statusMessage: 'Session not found' })

    return { ...updated, _id: id }
  } catch (err: any) {
    if (err?.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Session already exists for this group/date/time'
      })
    }
    throw err
  }
})
