import { z } from 'zod'

export const sessionSchema = z.object({
  /** Identifiant logique pour savoir à quel groupe appartient la séance:
   *  ex : "foot-adultes", "basket-u15"  */
  groupId: z.string().min(1),

  /** Sport ou activité principale. */
  sport: z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9\- ]+$/, 'letters, numbers, dash and space only')
  .min(1),

  /** Date ISO locale (YYYY-MM-DD) du créneau. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  /** Heure de début facultative => permet plusieurs créneaux le même jour. */
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // "19:00"

  capacity: z.number().int().positive().default(24),

  isClosed: z.boolean().default(false),

  createdAt: z.string().datetime().default(() => new Date().toISOString())
})

export const sessionUpdateSchema = sessionSchema.partial()

export type Session = z.infer<typeof sessionSchema>
