// server/api/registrations.post.ts
import { defineEventHandler, createError } from 'h3'
import { validateBody } from '~/server/utils/validate'
import { getCollection } from '~/server/database'
import { mongoClient } from '~/server/database/mongo'
import { ObjectId } from 'mongodb'
import { sendPush } from '~/server/utils/push'

import type { Session } from '~/server/schemas/session'
import {
  registrationSchema,
  type RegistrationDb,
  type RegistrationRes
} from '~/server/schemas/registration'

export default defineEventHandler(async (event) => {
  /** 1 · valider le payload minimal */
  const body = await validateBody(
    event,
    registrationSchema.pick({ sessionId: true, playerId: true })
  )

  /** 2 · collections typées */
  const sessionsCol      = await getCollection<Session>('sessions')
  const registrationsCol = await getCollection<RegistrationDb>('registrations')

  const sessionId = new ObjectId(body.sessionId)
  const playerId  = new ObjectId(body.playerId)

  /** 3 · transaction ------------------------------------------------ */
  let tmp: RegistrationRes | undefined // ← variable temporaire
  const sess = mongoClient.startSession()

  try {
    await sess.withTransaction(async () => {
      const session = await sessionsCol.findOne(
        { _id: sessionId, isClosed: false },
        { session: sess }
      )
      if (!session)
        throw createError({ statusCode: 404, statusMessage: 'Session not found or closed' })

      const exists = await registrationsCol.findOne(
        { sessionId, playerId },
        { session: sess }
      )
      if (exists)
        throw createError({ statusCode: 409, statusMessage: 'Already registered' })

      const confirmed = await registrationsCol.countDocuments(
        { sessionId, status: 'confirmed' },
        { session: sess }
      )
      const status = confirmed < session.capacity ? 'confirmed' : 'waitlist'

      const regDoc: RegistrationDb = {
        sessionId,
        playerId,
        status,
        createdAt: new Date().toISOString()
      }
      const { insertedId } = await registrationsCol.insertOne(regDoc, { session: sess })

      tmp = {
        _id: insertedId.toString(),
        sessionId: sessionId.toString(),
        playerId:  playerId.toString(),
        status,
        createdAt: regDoc.createdAt
      }
    })
  } finally {
    await sess.endSession()
  }

  /** 4 · tmp doit exister maintenant */
  if (!tmp) {
    throw createError({ statusCode: 500, statusMessage: 'Registration insertion failed' })
  }
  const insertedReg = tmp        // ← TypeScript sait qu’ici c’est non-undef.

  /** 5 · notification éventuelle */
  if (insertedReg.status === 'confirmed') {
    await sendPush(playerId, {
      title: 'Inscription confirmée !',
      body:  'Tu es bien inscrit pour la séance.',
      url:   `/sessions/${insertedReg.sessionId}`
    })
  }

  return insertedReg
})
