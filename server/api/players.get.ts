import { defineEventHandler, getQuery } from 'h3'
import { getCollection } from '~/server/database'
import type { Player } from '~/server/schemas/player'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/* 1. Schéma Zod pour valider / typer les paramètres de requête       */
/* ------------------------------------------------------------------ */
const querySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),      // ?page=2
  limit:  z.coerce.number().int().min(1).max(100).default(20),// ?limit=50
  sort:   z.enum(['firstName', 'lastName', 'joinedAt']).default('lastName'),
  dir:    z.enum(['asc', 'desc']).default('asc'),
  search: z.string().min(1).optional()                        // ?search=ali
})
type Query = z.infer<typeof querySchema>

/* ------------------------------------------------------------------ */
/* 2. Handler principal                                               */
/* ------------------------------------------------------------------ */
export default defineEventHandler(async (event) => {
  /* 2-A. Lecture + validation des query params --------------------- */
  const rawQuery       = getQuery(event)               // { page:'2', limit:'10', … }
  const { page, limit, sort, dir, search } = querySchema.parse(rawQuery) as Query

  /* 2-B. Construction du filtre Mongo ----------------------------- */
  const filter: Record<string, any> = { isArchived: false }

  // Simple recherche insensible à la casse sur firstName + lastName
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } }
    ]
  }

  /* 2-C. Accès collection + comptage total ------------------------ */
  const playersCol = await getCollection<Player>('players')

  const total = await playersCol.countDocuments(filter)

  /* 2-D. Requête paginée + tri ------------------------------------ */
  const sortObj = { [sort]: dir === 'asc' ? 1 : -1 }         // { lastName: 1 }

  const cursor  = playersCol
    .find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)

  const docs = await cursor.toArray()

  /* 2-E. Transformation _id -> string ----------------------------- */
  const data = docs.map((p) => ({ ...p, _id: (p as any)._id.toString() }))

  /* 2-F. Réponse avec méta-données ------------------------------- */
  return {
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data
  }
})
