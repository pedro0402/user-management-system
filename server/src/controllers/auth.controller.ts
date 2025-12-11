import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { postLoginSchema } from "../schemas/auth.schema";
import { compare } from "bcryptjs";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { signJwt } from "../utils/jwt";

export const postLogin = async (req: Request, res: Response) => {
    const { email, password } = postLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new UnauthorizedException('Credenciais inválidas')
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas')
    }

    const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role
    })

    const { password: _, ...userPublic } = user;

    return res.json({ user: userPublic, token })
}