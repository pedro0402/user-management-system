import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from '@prisma/client';
import { NotFoundException } from "../exceptions/NotFoundException";
import { ValidationException } from "../exceptions/ValidationException";

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "ValidationError",
            issues: err.issues.map(i => ({
                path: i.path.join('.'),
                message: i.message,
                code: i.code
            }))
        })
    }

    if (err instanceof ValidationException) {
        return res.status(err.status).json({
            error: err.name,
            message: err.message
        })
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                conflict: 'Conflict',
                message: 'E-mail já existente'
            })
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: 'NotFound',
                message: 'Usuário não encontrado'
            })
        }
    }

    if (err instanceof NotFoundException) {
        return res.status(err.status).json({
            error: err.name,
            message: err.message
        })
    }

    return res.status(500).json({
        error: "InternalServerError",
        message: "Algo inesperado aconteceu"
    });
}