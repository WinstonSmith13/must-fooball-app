// server/api/sessions.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { getCollection } from '~/server/database'
import type { Session } from '~/server/schemas/session'
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/* 1. Validation / typage des query-params                            */
/* ------------------------------------------------------------------ */
const querySchema = z.object({
  page:  z.coerce.number().int().positive().default(1),        // ?page=2
  limit: z.coerce.number().int().min(1).max(100).default(20),  // ?limit=50
  sort:  z.enum(['date', 'startTime', 'groupId', 'sport']).default('date'),
  dir:   z.enum(['asc', 'desc']).default('asc'),
  /** recherche libre dans groupId OU sport */
  search: z.string().min(1).optional()
})
type Query = z.infer<typeof querySchema>

/* ------------------------------------------------------------------ */
/* 2. Handler principal                                               */
/* ------------------------------------------------------------------ */
export default defineEventHandler(async (event) => {
  /* 2-A. lecture + validation des query params -------------------- */
  const rawQuery = getQuery(event)
  const { page, limit, sort, dir, search } = querySchema.parse(rawQuery) as Query

  /* 2-B. construction du filtre Mongo ----------------------------- */
  const filter: Record<string, any> = { isClosed: false }      // ou isArchived:false

  if (search) {
    filter.$or = [
      { groupId: { $regex: search, $options: 'i' } },
      { sport:   { $regex: search, $options: 'i' } }
    ]
  }

  /* 2-C. accès collection + comptage total ------------------------ */
  const sessionsCol = await getCollection<Session>('sessions')
  const total       = await sessionsCol.countDocuments(filter)

  /* 2-D. requête paginée + tri ------------------------------------ */
  const sortObj = { [sort]: dir === 'asc' ? 1 : -1 }

  const docs = await sessionsCol
    .find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  /* 2-E. transformation _id → string ----------------------------- */
  const data = docs.map(s => ({ ...s, _id: (s as any)._id.toString() }))

  /* 2-F. réponse avec méta-données ------------------------------- */
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
