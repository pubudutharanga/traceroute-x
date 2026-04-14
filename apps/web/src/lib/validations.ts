/**
 * TraceRoute X — Zod Validation Schemas
 * ========================================
 * Centralized validation for all API inputs.
 */

import { z } from "zod"

// ---- Common ----

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_-]+$/, "Slug must be alphanumeric with hyphens or underscores")

export const periodSchema = z.enum(["7d", "30d", "90d"]).default("30d")

// ---- Comments ----

export const createCommentSchema = z.object({
  postSlug: slugSchema,
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
  parentId: z.string().cuid().optional(),
})

export const getCommentsSchema = z.object({
  postSlug: slugSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

// ---- Likes ----

export const likeSchema = z.object({
  postSlug: slugSchema,
})

// ---- Analytics ----

export const pageviewSchema = z.object({
  postSlug: slugSchema,
  visitorId: z.string().min(1).max(100),
  referrer: z.string().url().optional().or(z.literal("")),
  scrollDepth: z.number().min(0).max(1).optional(),
})

// ---- Users (Admin) ----

export const createAuthorSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(
      /^[a-z0-9_]+$/,
      "Username must be lowercase letters, numbers, and underscores only",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  bio: z.string().max(500).optional(),
  email: z.string().email("Invalid email address"),
})

export const updateAuthorSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional(),
  bio: z.string().max(500).optional(),
})

// ---- Profile ----

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
})

// ---- Type Exports ----

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type GetCommentsInput = z.infer<typeof getCommentsSchema>
export type LikeInput = z.infer<typeof likeSchema>
export type PageviewInput = z.infer<typeof pageviewSchema>
export type CreateAuthorInput = z.infer<typeof createAuthorSchema>
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
