/**
 * Admin User Detail API
 * DELETE /api/admin/users/[id] — SUPPER_ADMIN deletes a user
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    
    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    // Because the Author and Like relations use onDelete: Cascade, 
    // deleting the User will cleanly remove the author profile and likes.
    // Notice: Comments do not cascade cleanly if they have replies in Threading, 
    // but we use onDelete: Cascade in Prisma for user->comments.
    
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "User deleted" })
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
