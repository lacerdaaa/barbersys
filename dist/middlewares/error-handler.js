"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const http_error_1 = require("../errors/http-error");
const logger_1 = require("../config/logger");
function errorHandler(err, _req, res, _next) {
    if (err instanceof http_error_1.HttpError) {
        logger_1.logger.warn(`${err.status} - ${err.message}`);
        return res.status(err.status).json({ error: err.message });
    }
    logger_1.logger.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
}
