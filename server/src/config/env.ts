import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Robust multi-path loading: ensures .env is found whether run from root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/tripwise?schema=public'),
  JWT_SECRET: z.string().default('tripwise-dev-secret-super-secure-key-32chars'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  
  // External APIs (Optional - checked at runtime with graceful fallback)
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  WEATHER_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
