import { PrismaClient } from '@prisma/client';

// ── Prisma singleton (dev hot-reload safe) ───────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    errorFormat: 'minimal',
  });
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// ── Re-export Prisma types for convenience ───────────────────────
export * from '@prisma/client';
export { PrismaClient };
