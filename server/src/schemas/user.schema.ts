import { z } from 'zod'
import { utf8Length } from '../utils/utf8Length';

export const getQuerySchema = z.object({
    page: z.coerce.number()
        .min(1)
        .default(1),

    perPage: z.coerce.number()
        .min(1)
        .max(100)
        .default(10),

    orderBy: z.enum(['createdAt', 'name', 'email', 'updatedAt'])
        .default('createdAt'),

    orderDirection: z.enum(['asc', 'desc'])
        .default('desc'),

    search: z.string()
        .trim()
        .max(100)
        .transform(value => value === "" ? undefined : value)
        .optional(),

    role: z.string()
        .trim()
        .optional(),
})

export const getParamSchema = z.object({
    id: z.uuid()
});

export const patchUserSchema = z.object({
    name: z.string().trim().optional(),
    email: z.email().toLowerCase().trim().optional(),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
        .refine((val) => utf8Length(val) <= 72, {
            message: 'Senha não corresponde com o tamanho permitido'
        }).optional(),
    avatarUrl: z.url().nullable().optional(),
    role: z.enum(['admin', 'user']).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar."
})

export const postUserSchema = z.strictObject({
    name: z.string().trim(),
    email: z.email().toLowerCase().trim(),
    role: z.string().trim().toLowerCase().optional(),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').refine((val) => utf8Length(val) <= 72, { message: 'Senha não corresponde com o tamanho permitido' }),
    avatarUrl: z.url().nullable().optional(),
})