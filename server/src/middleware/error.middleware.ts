import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { isProd } from '../config/env.js';

function sanitizeErrorMessage(msg: string): string {
  return msg
    .replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***:***@')
    .replace(/password[:=]\s*['"]?[^'"\s]+['"]?/gi, 'password=***')
    .replace(/sbp_oauth_[a-zA-Z0-9_-]+/gi, '***')
    .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi, '***');
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, sanitizeErrorMessage(err.message), err.statusCode, err.code, err.details);
    return;
  }

  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    sendError(res, 'Malformed JSON payload in request body', 400, 'BAD_REQUEST');
    return;
  }

  // Handle Prisma unique constraint violations (P2002)
  if ('code' in err && (err as { code: string }).code === 'P2002') {
    sendError(res, 'A record with that unique value already exists', 409, 'CONFLICT');
    return;
  }

  // Unexpected errors
  console.error('Unhandled server error:', err);

  const message = isProd ? 'Internal server error' : sanitizeErrorMessage(err.message);
  sendError(res, message, 500, 'INTERNAL_ERROR', isProd ? undefined : err.stack ? sanitizeErrorMessage(err.stack) : undefined);
};
