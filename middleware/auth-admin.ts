import { defineEventHandler, createError } from 'h3'

export default defineEventHandler((event) => {
  const user = event.context.user       // injecté par ton middleware JWT
  if (!user?.roles?.includes('admin')) {
    throw createError({ statusCode: 401, statusMessage: 'Admin only' })
  }
})
