import { defineEventHandler, createError } from 'h3'
import { getCollection } from '~/server/database'
import type { Player } from '~/server/schemas/player'
import { ObjectId } from 'mongodb'

export default defineEventHandler ( async (event) => {

  const id = event.context.params!.id
  const playerId = new ObjectId(id)
  const playersCol = await getCollection<Player>('players')
  const regsCol    = await getCollection('registrations')

  const player = await playersCol.findOne({ _id: playerId })
  if (!player) throw createError({ statusCode: 404, statusMessage: 'Player not found' })


  const hasReg = await regsCol.findOne({ playerId })

  if (hasReg) {

    await playersCol.updateOne (
      { _id: playerId },
      { $set: { isArchived: true, archivedAt: new Date().toISOString() } }
    )
    event.node.res.statusCode = 204          // No Content
    return
  }

  /* 2-b. Aucun lien -> hard delete */
  await playersCol.deleteOne({ _id: playerId })
  event.node.res.statusCode = 204

})
