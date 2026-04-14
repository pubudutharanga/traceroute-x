/**
 * TraceRoute X — Auth Utilities
 * ================================
 * Server-side helpers for auth checks in API routes and server components.
 */

import { auth } from "@/lib/auth"
import { prisma } from "@traceroutex/db"
import type { Role } from "@traceroutex/db"
import bcrypt from "bcryptjs"

const BCRYPT_COST = 12

/**
 * Get the current authenticated session.
 * Throws 401 if not authenticated.
 */
export async function requireAuth(requiredRole?: Role) {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError("Unauthorized", 401)
  }

  if (requiredRole && session.user.role !== requiredRole) {
    // Also allow SUPER_ADMIN for any role check (they have full access)
    if (session.user.role !== "SUPER_ADMIN") {
      throw new AuthError("Forbidden", 403)
    }
  }

  return session
}

/**
 * Require SUPER_ADMIN role.
 */
export async function requireSuperAdmin() {
  const session = await auth()

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new AuthError("Forbidden — Super Admin access required", 403)
  }

  return session
}

/**
 * Require AUTHOR or SUPER_ADMIN role.
 */
export async function requireAuthorOrAbove() {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError("Unauthorized", 401)
  }

  if (session.user.role !== "AUTHOR" && session.user.role !== "SUPER_ADMIN") {
    throw new AuthError("Forbidden — Author access required", 403)
  }

  return session
}

/**
 * Get current user with full DB data (optional, returns null if not authenticated).
 */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      website: true,
      role: true,
      username: true,
      isActive: true,
      createdAt: true,
      author: {
        select: {
          slug: true,
          displayName: true,
        },
      },
    },
  })
}

/**
 * Hash a password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST)
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Custom auth error with HTTP status code.
 */
export class AuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}
