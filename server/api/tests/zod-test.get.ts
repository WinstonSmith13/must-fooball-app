import { playerSchema } from '~/server/schemas/player'

export default defineEventHandler(() => {
  return playerSchema.parse({ firstName:'Alice', lastName:'Dupont' })
})
