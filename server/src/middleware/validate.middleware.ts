import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Request validation failed', issues));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Query parameter validation failed', issues));
      } else {
        next(error);
      }
    }
  };
};
