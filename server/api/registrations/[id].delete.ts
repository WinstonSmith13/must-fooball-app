// server/api/registrations/[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import { getCollection } from '~/server/database'
import { ObjectId } from 'mongodb'
import { sendPush } from '~/server/utils/push'

export default defineEventHandler(async (event) => {
  const regId = new ObjectId(event.context.params!.id)
  const registrationsCol = await getCollection('registrations')
  const sessionsCol      = await getCollection('sessions')

  const client = registrationsCol.database.client
  const mongoSession = client.startSession()

  let promotedPlayerId: ObjectId | null = null

  try {
    await mongoSession.withTransaction(async () => {
      /* 1. Trouve l’inscription supprimée */
      const reg = await registrationsCol.findOne({ _id: regId }, { session: mongoSession })
      if (!reg) throw createError({ statusCode: 404, statusMessage: 'Registration not found' })

      /* 2. Supprime-la */
      await registrationsCol.deleteOne({ _id: regId }, { session: mongoSession })

      /* 3. Comptage confirmés après suppression */
      const confirmedCount = await registrationsCol.countDocuments(
        { sessionId: reg.sessionId, status: 'confirmed' },
        { session: mongoSession }
      )

      /* 4. Récupère la capacité de la session */
      const session = await sessionsCol.findOne({ _id: reg.sessionId }, { session: mongoSession })
      if (!session) return   // session supprimée ? => on sort

      /* 5. S’il reste de la place → promote le plus ancien waitlisté */
      if (confirmedCount < session.capacity) {
        const wait = await registrationsCol.findOne(
          { sessionId: reg.sessionId, status: 'waitlist' },
          { sort: { createdAt: 1 }, session: mongoSession }
        )
        if (wait) {
          await registrationsCol.updateOne(
            { _id: wait._id },
            { $set: { status: 'confirmed' } },
            { session: mongoSession }
          )
          promotedPlayerId = wait.playerId
        }
      }
    })
  } finally {
    await mongoSession.endSession()
  }

  /* 6. Notif push pour le joueur promu (hors transaction) */
  if (promotedPlayerId) {
    await sendPush(promotedPlayerId, {
      title: 'Bonne nouvelle !',
      body:  'Une place s’est libérée : tu es confirmé !',
      url:   '/my-sessions'
    })
  }

  return { ok: true }
})
