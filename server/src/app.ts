import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import tripRoutes from './routes/trip.routes.js';
import travelRoutes from './routes/travel.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { env, isProd } from './config/env.js';
import { NotFoundError } from './utils/errors.js';
import { sendSuccess } from './utils/response.js';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration for cookies
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// General Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use(generalLimiter);

// Parse request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', travelRoutes);

// Catch-all 404 handler
app.use((_req, _res, next) => {
  next(new NotFoundError('The requested endpoint does not exist'));
});

// Centralized error handling middleware
app.use(errorHandler);
