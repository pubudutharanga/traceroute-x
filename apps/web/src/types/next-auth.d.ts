/**
 * NextAuth.js type augmentation
 * Extends the default Session and JWT types with custom fields
 */

import type { Role } from "@traceroutex/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      username?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    role?: Role
    username?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    role?: Role
    username?: string | null
  }
}
