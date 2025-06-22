import { defineEventHandler, createError } from 'h3'
import { getCollection } from '~/server/database'
import type { Player } from '~/server/schemas/player'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  // 1. Récupère l'id dynamique dans l'URL
  const id = event.context.params!.id

  // 2. Accès collection typée
  const players = await getCollection<Player>('players')

  // 3. Recherche en base
  const doc = await players.findOne({ _id: new ObjectId(id) })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  }

  // 4. Convertit _id en string puis renvoie
  return { ...doc, _id: id }
})
