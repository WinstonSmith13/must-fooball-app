import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const registrationSchema = z.object({
  sessionId: z.string().min(1),
  playerId:  z.string().min(1),
  status:    z.enum(['confirmed', 'waitlist']),
  createdAt: z.string().datetime().default(() => new Date().toISOString())
})

/** Format utilisé côté front (string) */
export type Registration = z.infer<typeof registrationSchema>

/** Format en base (ObjectId) */
export type RegistrationDb = Omit<Registration, 'sessionId' | 'playerId'> & {
  sessionId: ObjectId
  playerId:  ObjectId
}

/** Format renvoyé par l’API (contient _id) */
export type RegistrationRes = Registration & { _id: string }

export const registrationUpdateSchema = registrationSchema.partial()
