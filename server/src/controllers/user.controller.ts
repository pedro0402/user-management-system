import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import * as schema from "../schemas/user.schema";

import { ZodError } from 'zod'
import { Prisma } from "@prisma/client";

import { hashPassword } from '../utils/hashPassword';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const queryParams = schema.getQuerySchema.parse(req.query);

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
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = schema.getParamSchema.parse(req.params);

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
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = schema.postUserSchema.parse(req.body)

        const passwordHash = await hashPassword(password);

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
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = schema.getParamSchema.parse(req.params);

        const data = schema.patchUserSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { id },
        })

        if (!existingUser) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        if (data.password) {
            data.password = await hashPassword(data.password)
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
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = schema.getParamSchema.parse(req.params);

        await prisma.user.delete({
            where: { id },
        })

        return res.status(204).send();
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

        if (err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
        ) {
            return res.status(404).json({
                error: 'NotFound',
                message: 'Usuário não encontrado'
            })
        }

        console.error(err)
        return res.status(500).json({ error: 'InternalServerError' })
    }
}