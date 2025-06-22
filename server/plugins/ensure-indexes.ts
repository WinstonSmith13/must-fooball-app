import { defineNitroPlugin } from '#imports'
import { ensureIndexes } from '~/server/database'

export default defineNitroPlugin(async () => {
  await ensureIndexes()
})
