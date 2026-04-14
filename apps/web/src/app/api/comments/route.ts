/**
 * Comments API
 * GET  /api/comments?postSlug=xxx — Public, returns threaded comments
 * POST /api/comments — Auth required, creates a comment
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"
import { createCommentSchema, getCommentsSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = getCommentsSchema.safeParse({
      postSlug: searchParams.get("postSlug"),
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { postSlug, page, limit } = parsed.data

    // Fetch top-level comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        postSlug,
        parentId: null,
        isDeleted: false,
        status: "APPROVED",
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        replies: {
          where: { isDeleted: false, status: "APPROVED" },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
            replies: {
              where: { isDeleted: false, status: "APPROVED" },
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.comment.count({
      where: { postSlug, parentId: null, isDeleted: false, status: "APPROVED" },
    })

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("GET /api/comments error:", error?.message || error, error?.stack)
    return NextResponse.json(
      { error: "Internal server error", message: error?.message },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { postSlug, content, parentId } = parsed.data

    // Verify parent comment exists if replying
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      })
      if (!parent || parent.postSlug !== postSlug) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postSlug,
        content,
        userId: session.user.id,
        parentId: parentId || null,
        status: "APPROVED",
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("POST /api/comments error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
