import express from 'express'

import { z } from 'zod'
import { PrismaClient } from "@prisma/client"
import { hash } from 'bcryptjs'

const app = express();
const PORT = 3333;
const prisma = new PrismaClient();


app.use(express.json());

app.get('/', (req, res) => {
    return res.json({message: 'hello world. servidor rodando'})
})

app.post('/users', async (req, res) => {
    try {
        const userSchema = z.object({
            name: z.string(),
            email: z.email(),
            password: z.string()
        })

        const userData = userSchema.parse(req.body)

        let passwordHash = await hash(userData.password, 6);

        const newUser = await prisma.user.create({ 
            data: {
                ...userData,
                password: passwordHash 
            }
         })
        
        return res.status(201).json(newUser)
    } catch(err) {
        return res.status(401).json({ error: err })
    }
})  

app.listen(PORT, () => console.log(`server running on port ${PORT}`))