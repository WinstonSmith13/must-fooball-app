import { playerSchema } from '~/server/schemas/player'

console.log(playerSchema.parse({ name: 'Alice' }))
