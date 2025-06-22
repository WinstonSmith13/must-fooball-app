// server/api/registrations/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import { getCollection } from '~/server/database'
import type { Registration } from '~/server/schemas/registration'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  /* 1. Id dynamique dans l’URL ----------------------------------- */
  const id = event.context.params!.id
  const regId = new ObjectId(id)

  /* 2. Accès collection typée ------------------------------------ */
  const regsCol = await getCollection<Registration>('registrations')

  /* 3. Recherche en base ----------------------------------------- */
  const doc = await regsCol.findOne({ _id: regId })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  /* 4. Conversion ObjectId → string ------------------------------ */
  return {
    ...doc,
    _id: id,
    sessionId: (doc.sessionId as any).toString(),
    playerId:  (doc.playerId  as any).toString()
  }
})
