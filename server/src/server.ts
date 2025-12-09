import express from 'express'
import { email, z, ZodError } from 'zod'
import { PrismaClient } from "@prisma/client"
import { hash } from 'bcryptjs'
import { Prisma } from '@prisma/client';
import { error } from 'console';

const app = express();
const PORT = 3333;
const prisma = new PrismaClient();

const textEncoder = new TextEncoder;

const SALT_ROUNDS = 10;
const utf8Length = (s: string) => textEncoder.encode(s).length;

app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const querySchema = z.object({
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

        const queryParams = querySchema.parse(req.query);

        const { page, perPage, orderBy, orderDirection, search, role } = queryParams;

        const skip = (page - 1) * perPage;
        const take = perPage;

        const where: Prisma.UserWhereInput = {}
        if (role) {
            where.role = role
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const orderClause: Prisma.UserOrderByWithRelationInput = { [orderBy]: orderDirection }

        const total = await prisma.user.count({ where })

        const items = await prisma.user.findMany({
            where,
            orderBy: orderClause,
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        const totalPages = Math.ceil(total / perPage)
        const meta = {
            total,
            page,
            perPage,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }

        return res.status(200).json({ items, meta })
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: 'ValidationError',
                issues: err.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                    code: i.code
                }))
            })
        }
        console.error(err)
        return res.status(500).json({ error: 'InternalServerError' })
    }
})

app.get('/users/:id', async (req, res) => {
    try {
        const paramSchema = z.object({
            id: z.uuid()
        });

        const { id } = paramSchema.parse(req.params);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!user) {
            return res.status(404).json({
                error: 'NotFound',
                message: 'Usuário não encontrado'
            })
        };

        return res.status(200).json(user)
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: 'ValidationError',
                issues: err.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                    code: i.code
                }))
            })
        }

        console.error(err)
        return res.status(500).json({ error: 'InternalServerError' })
    }
})

app.patch('/users/:id', async (req, res) => {
    try {
        const paramSchema = z.object({
            id: z.uuid()
        })

        const { id } = paramSchema.parse(req.params);

        const userSchema = z.object({
            name: z.string().trim().optional(),
            email: z.email().toLowerCase().trim().optional(),
            password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
                .refine((val) => utf8Length(val) <= 72, {
                    message: 'Senha não corresponde com o tamanho permitido'
                }).optional()
        })

        const data = userSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { id },
        })

        if (!existingUser) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        if (data.password) {
            data.password = await hash(data.password, SALT_ROUNDS);
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'ValidationError', message: 'Nenhum campo para atualizar' })
        }

        const updated = await prisma.user.update({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                role: true,
            },
            data,
        })

        return res.status(200).json(updated)
    }
    catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: 'ValidationError',
                issues: err.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                    code: i.code
                }))
            })
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return res.status(409).json({
                    conflict: 'Conflict',
                    message: 'E-mail já existente'
                })
            }
        }

        console.error(err);
        return res.status(500).json({ error: 'InternalServerError' })

    }
})

app.post('/users', async (req, res) => {
    try {
        const userSchema = z.strictObject({
            name: z.string().trim(),
            email: z.email().toLowerCase().trim(),
            password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').refine((val) => utf8Length(val) <= 72, { message: 'Senha não corresponde com o tamanho permitido' })
        })

        const { name, email, password } = userSchema.parse(req.body)

        const passwordHash = await hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                role: true,
            }
        })

        return res.status(201).json(newUser)
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: 'ValidationError',
                issues: err.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                    code: i.code
                }))
            })
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return res.status(409).json({
                    conflict: 'Conflict',
                    message: 'E-mail já existente'
                })
            }
        }

        console.error(err)
        return res.status(500).json({ error: 'InternalServerError' })
    }
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))