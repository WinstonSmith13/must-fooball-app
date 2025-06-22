import { defineEventHandler, createError } from 'h3'
import { sessionSchema, type Session } from '~/server/schemas/session'
import { getCollection } from '~/server/database'
import { validateBody } from '~/server/utils/validate'

export default defineEventHandler(async (event) => {
  /* 1. validation structure + defaults */
  const body = await validateBody(event, sessionSchema)

  /* 2. insertion --------------------------------------------------- */
  const sessionsCol = await getCollection<Session>('sessions')

  try {
    const { insertedId } = await sessionsCol.insertOne(body)
    return { _id: insertedId.toString(), ...body }
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
