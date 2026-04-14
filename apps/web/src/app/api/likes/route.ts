/**
 * Likes API
 * GET  /api/likes?postSlug=xxx — Public, returns count + user's liked status
 * POST /api/likes — Auth required, toggles like
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"
import { likeSchema, slugSchema } from "@/lib/validations"

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  try {
    const postSlug = req.nextUrl.searchParams.get("postSlug")
    const parsed = slugSchema.safeParse(postSlug)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid postSlug" }, { status: 400 })
    }

    const count = await prisma.like.count({
      where: { postSlug: parsed.data },
    })

    // Check if current user has liked
    let userLiked = false
    const session = await auth()
    if (session?.user?.id) {
      const existing = await prisma.like.findUnique({
        where: {
          postSlug_userId: {
            postSlug: parsed.data,
            userId: session.user.id,
          },
        },
      })
      userLiked = !!existing
    }

    return NextResponse.json({ count, userLiked })
  } catch (error) {
    console.error("GET /api/likes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
    const parsed = likeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { postSlug } = parsed.data

    // Toggle: check if already liked
    const existing = await prisma.like.findUnique({
      where: {
        postSlug_userId: {
          postSlug,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      // Unlike
      await prisma.like.delete({
        where: { id: existing.id },
      })
    } else {
      // Like
      await prisma.like.create({
        data: {
          postSlug,
          userId: session.user.id,
        },
      })
    }

    const count = await prisma.like.count({ where: { postSlug } })

    return NextResponse.json({
      liked: !existing,
      count,
    })
  } catch (error) {
    console.error("POST /api/likes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
