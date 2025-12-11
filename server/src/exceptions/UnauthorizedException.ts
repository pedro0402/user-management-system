export class UnauthorizedException extends Error {
    status: number;
    constructor(message: string){
        super(message);
        this.name = 'InvalidCredentials';
        this.status = 401;
    }
}