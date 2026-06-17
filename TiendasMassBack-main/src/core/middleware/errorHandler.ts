import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  if (err.name === 'ZodError') {
    return res.status(400).json({ message: 'Error de validación', error: err });
  }

  console.error('❌ Error no manejado:', err);
  return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
};
