import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { verifyJwt } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException("Token não fornecido")
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
        const decoded = verifyJwt(token);
        (req as any).user = decoded;
        next();
    } catch (err) {
        throw new UnauthorizedException("Token inválido ou expirado")
    }
}