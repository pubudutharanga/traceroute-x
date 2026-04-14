import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

type CommentWithUser = Awaited<ReturnType<typeof getComments>>[number]

async function getComments() {
  return prisma.comment.findMany({
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export default async function AdminCommentsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin/dashboard")

  const comments: CommentWithUser[] = await getComments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Comment Moderation</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Review and manage comments across all posts
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] divide-y divide-[var(--border-primary)]">
        {comments.length === 0 ? (
          <div className="px-6 py-12 text-center text-[var(--text-tertiary)]">
            No comments to moderate
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-6 hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="flex items-start gap-4">
                {comment.user.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.name || ""}
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {(comment.user.name || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">
                      {comment.user.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      on <span className="capitalize">{comment.postSlug.replace(/-/g, " ")}</span>
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      · {comment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {/* Status badges */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        comment.isDeleted
                          ? "bg-red-100 text-red-700"
                          : comment.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : comment.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {comment.isDeleted ? "Deleted" : comment.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
