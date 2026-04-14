/**
 * TraceRoute X — Auth Configuration
 * ====================================
 * NextAuth.js v5 with Google, GitHub, and Credentials providers.
 * JWT strategy with role embedded in token.
 */

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@traceroutex/db"
import type { Role } from "@traceroutex/db"
import { authConfig } from "./auth.config"

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const username = credentials.username as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { username },
          include: { author: true },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated")
        }

        // Only AUTHOR and SUPER_ADMIN can use credentials login
        if (user.role !== "AUTHOR" && user.role !== "SUPER_ADMIN") {
          return null
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          username: user.username,
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) return false

        // Upsert user on OAuth login
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              avatarUrl: user.image || null,
              provider: account.provider === "google" ? "GOOGLE" : "GITHUB",
              role: "USER",
            },
          })
        } else if (!existingUser.isActive) {
          // Block deactivated users
          return false
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Initial login — attach user data to token
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, username: true },
        })

        if (dbUser) {
          token.userId = dbUser.id
          token.role = dbUser.role
          token.username = dbUser.username
        }
      }

      // Handle session updates (e.g., profile changes)
      if (trigger === "update" && session) {
        token.name = session.name
      }

      return token
    },
  },
})

export const { handlers, auth } = nextAuth
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- avoids TS declaration-emit portability error with @auth/core in pnpm monorepos
export const signIn: any = nextAuth.signIn
export const signOut: any = nextAuth.signOut
