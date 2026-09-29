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

export async function checkDbConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Quick test query to verify if PostgreSQL connection is live
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}
