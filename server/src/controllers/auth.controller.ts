import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service.js';
import { DbService } from '../services/db.service.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../schemas/auth.schema.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password }: RegisterInput = req.body;

      const existingUser = await DbService.findUserByEmail(email);
      if (existingUser) {
        throw new ConflictError('An account with this email address already exists');
      }

      const passwordHash = await AuthService.hashPassword(password);
      const user = await DbService.createUser({
        name,
        email,
        passwordHash,
      });

      const token = AuthService.generateToken({
        userId: user.id,
        email: user.email,
      });

      AuthService.setAuthCookie(res, token);

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          },
          token, // also returned in body for non-browser/test clients
        },
        'Registration successful',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      const user = await DbService.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const token = AuthService.generateToken({
        userId: user.id,
        email: user.email,
      });

      AuthService.setAuthCookie(res, token);

      sendSuccess(
        res,
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          },
          token,
        },
        'Logged in successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthService.clearAuthCookie(res);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      sendSuccess(res, {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          emailVerified: req.user.emailVerified,
          createdAt: req.user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { name, currentPassword, newPassword }: UpdateProfileInput = req.body;
      const updates: { name?: string; passwordHash?: string } = {};

      if (name) {
        updates.name = name;
      }

      if (newPassword) {
        if (!currentPassword) {
          throw new ValidationError('Current password is required to set a new password');
        }

        const isCurrentValid = await AuthService.comparePassword(
          currentPassword,
          req.user.passwordHash
        );
        if (!isCurrentValid) {
          throw new UnauthorizedError('Current password is incorrect');
        }

        updates.passwordHash = await AuthService.hashPassword(newPassword);
      }

      const updatedUser = await DbService.updateUser(req.user.id, updates);
      if (!updatedUser) {
        throw new UnauthorizedError('User account not found');
      }

      sendSuccess(
        res,
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            createdAt: updatedUser.createdAt,
          },
        },
        'Profile updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
