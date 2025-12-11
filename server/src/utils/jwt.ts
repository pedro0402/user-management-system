import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function signJwt(payload: object): string {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: '1h'
    });
}

export function verifyJwt(token: string): any {
    if (!JWT_SECRET) throw new Error("JWT não configurado.")
    return jwt.verify(token, JWT_SECRET);
}