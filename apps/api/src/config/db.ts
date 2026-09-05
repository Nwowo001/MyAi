/**
 * @fileoverview Prisma client singleton instance for database access.
 *
 * Prevents multiple PrismaClient instances in development mode (which can exhaust database connection pools).
 */

import { PrismaClient } from '@prisma/client';
import { isProduction } from './index.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
  });

if (!isProduction) {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
