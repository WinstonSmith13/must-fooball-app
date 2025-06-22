import { defineEventHandler, createError } from 'h3'
import { getCollection } from '~/server/database'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = event.context.params!.id
  const sessionId = new ObjectId(id)

  const sessionsCol      = await getCollection('sessions')
  const registrationsCol = await getCollection('registrations')

  /* 1. session existe ? -------------------------------------------- */
  const session = await sessionsCol.findOne({ _id: sessionId })
  if (!session) throw createError({ statusCode: 404, statusMessage: 'Session not found' })

  /* 2. y a-t-il des inscriptions encore ouvertes ? ----------------- */
  const reg = await registrationsCol.findOne({ sessionId })
  if (reg) {
    /* soft delete -> isArchived true (ou isClosed) */
    await sessionsCol.updateOne(
      { _id: sessionId },
      { $set: { isArchived: true, archivedAt: new Date().toISOString() } }
    )
    event.node.res.statusCode = 204
    return
  }

  /* 3. aucune inscription → hard delete --------------------------- */
  await sessionsCol.deleteOne({ _id: sessionId })
  event.node.res.statusCode = 204
})
