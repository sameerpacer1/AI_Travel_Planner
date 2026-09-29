import { Request, Response, NextFunction } from 'express';
import { AuthService, AUTH_COOKIE_NAME } from '../services/auth/auth.service.js';
import { DbService, UserRecord } from '../services/db.service.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.[AUTH_COOKIE_NAME];

    // Also support Bearer authorization header for testing and mobile client flexibility
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing or expired');
    }

    let payload;
    try {
      payload = AuthService.verifyToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await DbService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User account associated with this session no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
