import { z } from 'zod'
import { utf8Length } from '../utils/utf8Length'

export const postLoginSchema = z.object({
    email: z.email().toLowerCase().trim(),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').refine((val) => utf8Length(val) <= 72, { message: 'Senha não corresponde com o tamanho permitido' })
})