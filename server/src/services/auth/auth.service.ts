import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';
import { env, isProd } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const AUTH_COOKIE_NAME = 'tripwise_token';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd, // only true over HTTPS in production
  sameSite: isProd ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

  static setAuthCookie(res: Response, token: string): void {
    res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  }

  static clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}
