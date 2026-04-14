/**
 * TraceRoute X — Prisma Client Singleton
 * ========================================
 * Prevents multiple Prisma Client instances in development
 * when Next.js hot-reloads the server modules.
 *
 * Usage:
 *   import { prisma } from "@traceroutex/db"
 */

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Re-export all Prisma types for convenience
export * from "@prisma/client"
export type { PrismaClient }
