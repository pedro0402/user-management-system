import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import * as schema from "../schemas/user.schema";

import { Prisma } from "@prisma/client";

import { hashPassword } from '../utils/hashPassword';

import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from "../exceptions/ValidationException";

export const getUsers = async (req: Request, res: Response) => {
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
}

export const getUserById = async (req: Request, res: Response) => {
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
        throw new NotFoundException;
    };

    return res.status(200).json(user)
}

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = schema.postUserSchema.parse(req.body)

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: passwordHash,
            role
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
}

export const updateUser = async (req: Request, res: Response) => {

    const { id } = schema.getParamSchema.parse(req.params);

    const data = schema.patchUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
        where: { id },
    })

    if (!existingUser) {
        throw new NotFoundException;
    }

    if (data.password) {
        data.password = await hashPassword(data.password)
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

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = schema.getParamSchema.parse(req.params);

    await prisma.user.delete({
        where: { id },
    })

    return res.status(204).send();
}