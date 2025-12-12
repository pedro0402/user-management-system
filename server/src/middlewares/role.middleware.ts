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

export function requireSelfOrRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const loggedUser = req.user;
        const routerUserId = req.params.id;

        if (!loggedUser) return next(new ForbiddenException("Não autenticado"));

        if (loggedUser.role === role) return next();

        if (loggedUser.id === routerUserId) return next();

        return next("Você não tem permissão para acessar esse recurso")
    }
}