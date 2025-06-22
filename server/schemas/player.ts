import { z } from 'zod'

export const playerSchema = z.object({
  firstName: z.string().min(1, 'firstname required'),
  lastName:  z.string().min(1, 'lastname required'),


  email: z.string().email().optional().nullable(),


  phone: z.string()
          .regex(/^\+\d{7,15}$/, 'Format +33712345678')
          .optional()
          .nullable(),


  roles: z.array(z.enum(['player', 'admin']))
          .nonempty()
          .default(['player']),

  attendanceCount:     z.number().int().nonnegative().default(0),
  consecutiveSessions: z.number().int().nonnegative().default(0),

  isArchived: z.boolean().default(false),
  archivedAt: z.string().datetime().optional().nullable(),

  joinedAt: z.string().datetime().default(() => new Date().toISOString())
})

export type Player = z.infer<typeof playerSchema>
