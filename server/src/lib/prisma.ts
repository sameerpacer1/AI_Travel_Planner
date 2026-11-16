import { PrismaClient } from '@prisma/client';
import { env, isProd } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: isProd ? ['error'] : ['query', 'error', 'warn'],
  });

if (!isProd) {
  globalThis.prismaGlobal = prisma;
}

export async function checkDbConnection(retries = 3, delayMs = 1500): Promise<{ connected: boolean; error?: string }> {
  let lastError = '';
  for (let i = 1; i <= retries; i++) {
    try {
      // Quick test query to verify if PostgreSQL connection is live
      await prisma.$queryRaw`SELECT 1`;
      return { connected: true };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return { connected: false, error: lastError };
}
