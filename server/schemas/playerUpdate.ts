import { playerSchema } from './player'
import { z } from 'zod'

export const playerUpdateSchema = playerSchema
  .partial()                 // firstName?: string, ...
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Payload cannot be empty'
  })

export type PlayerUpdate = z.infer<typeof playerUpdateSchema>
