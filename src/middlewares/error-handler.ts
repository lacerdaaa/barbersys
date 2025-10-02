import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { logger } from '../config/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    logger.warn(`${err.status} - ${err.message}`);
    return res.status(err.status).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}
