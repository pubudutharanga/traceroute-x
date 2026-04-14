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

// @ts-ignore: Known NextAuth export portability issue in pnpm monorepos
export const { handlers, auth, signIn, signOut } = NextAuth({
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

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
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

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as Role
        session.user.username = (token.username as string) || undefined
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4321"
      
      // Allows relative urls
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows redirect to the main blog site
      if (url.startsWith(siteUrl)) return url
      
      try {
        // Allows callback URLs on the same origin
        if (new URL(url).origin === baseUrl) return url
      } catch {
        return baseUrl
      }
      
      return baseUrl
    },
  },
})
