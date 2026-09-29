import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/profile', requireAuth, validateRequest(updateProfileSchema), AuthController.updateProfile);

export default router;
