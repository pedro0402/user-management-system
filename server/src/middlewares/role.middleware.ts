import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../exceptions/ForbiddenException";

export function requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) return next(new ForbiddenException("Não autenticado"))
        if (user.role !== role) {
            return next(new ForbiddenException("Você não tem permissão para acessar este recurso"))
        }
        next();
    }
}