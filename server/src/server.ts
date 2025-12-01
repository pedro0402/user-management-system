import express from 'express'

import { z, ZodError } from 'zod'
import { PrismaClient } from "@prisma/client"
import { hash } from 'bcryptjs'
import { Prisma } from '@prisma/client';

const app = express();
const PORT = 3333;
const prisma = new PrismaClient();

const textEncoder = new TextEncoder;

const SALT_ROUNDS = 10;
const utf8Length = (s: string) => textEncoder.encode(s).length;

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({message: 'hello world. servidor rodando'})
})

app.post('/users', async (req, res) => {
    try {
        const userSchema = z.strictObject({
            name: z.string().trim(),
            email: z.email().toLowerCase().trim(),
            password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').refine((val) => utf8Length(val) <= 72, {message:'Senha não corresponde com o tamanho permitido'})
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
    } catch(err) {
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