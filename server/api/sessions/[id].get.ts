import { defineEventHandler, getQuery, createError } from 'h3'
import { getCollection } from '~/server/database'
import type { Session } from '~/server/schemas/session'
import type { RegistrationDb } from '~/server/schemas/registration'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = event.context.params!.id
  const sessionsCol = await getCollection<Session>('sessions')

  const { includeRegs } = getQuery(event)

  const doc = await sessionsCol.findOne({ _id: new ObjectId(id) })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Session not found' })

  const base = { ...doc, _id: id }

  if (includeRegs === 'true') {
    const regsCol = await getCollection<RegistrationDb>('registrations')
    const regs = await regsCol
      .find({ sessionId: new ObjectId(id) })
      .toArray()

    return {
      ...base,
      registrations: regs.map((r) => ({
        ...r,
        _id:       r._id.toString(),
        sessionId: r.sessionId.toString(),
        playerId:  r.playerId.toString()
      }))
    }
  }

  return base
})
