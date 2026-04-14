/**
 * Admin Users API
 * GET  /api/admin/users — SUPER_ADMIN, lists all users
 * POST /api/admin/users — SUPER_ADMIN, creates author account
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { createAuthorSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20))
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          provider: true,
          username: true,
          isActive: true,
          createdAt: true,
          author: {
            select: { displayName: true, slug: true },
          },
          // NEVER include passwordHash
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createAuthorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { displayName, username, password, bio, email } = parsed.data

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      )
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      )
    }

    const passwordHash = await hashPassword(password)

    // Generate slug from display name
    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Create User + Author in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        name: displayName,
        username,
        passwordHash,
        provider: "CREDENTIALS",
        role: "AUTHOR",
        isActive: true,
        author: {
          create: {
            displayName,
            slug,
            bio: bio || null,
            avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        author: {
          select: { displayName: true, slug: true },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
