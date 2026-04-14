/**
 * Comment Delete API
 * DELETE /api/comments/[id] — Owner or SUPER_ADMIN
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Only comment owner or SUPER_ADMIN can delete
    if (
      comment.userId !== session.user.id &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete
    await prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
