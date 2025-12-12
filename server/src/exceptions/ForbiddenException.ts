export class ForbiddenException extends Error {
    status: number;
    constructor(message: string ) {
        super(message);
        this.name = "ForbiddenException";
        this.status = 403;
    }
} 