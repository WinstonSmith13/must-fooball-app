import type { AnyZodObject } from 'zod'
import { readBody, createError, type H3Event } from 'h3'

/**
 * Lit le body JSON, le valide avec Zod et renvoie l’objet typé.
 * Lève automatiquement un 400 si le payload est invalide.
 */
export const validateBody = async <S extends AnyZodObject>(
  event: H3Event,
  schema: S
): Promise<ReturnType<S['parse']>> => {
  const raw = await readBody(event)
  const result = schema.safeParse(raw)

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.message })
  }
  return result.data
}
