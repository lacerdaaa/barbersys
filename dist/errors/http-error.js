"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'HttpError';
    }
}
exports.HttpError = HttpError;
class NotFoundError extends HttpError {
    constructor(message = 'Resource not found') {
        super(404, message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends HttpError {
    constructor(message = 'Não autorizado') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = 'Proibido') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends HttpError {
    constructor(message = 'Conflito') {
        super(409, message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends HttpError {
    constructor(message = 'Dados inválidos') {
        super(400, message);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
