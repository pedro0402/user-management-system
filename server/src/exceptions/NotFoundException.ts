export class NotFoundException extends Error {
    status: number;
    constructor(message: string = "Não encontrado") {
        super(message);
        this.name = "NotFoundError";
        this.status = 404;
    }
} 