import { prisma } from "@traceroutex/db"

export default async function AdminPostsPage() {
  const postsAnalytics = await prisma.postAnalytics.findMany({
    orderBy: { viewCount: "desc" },
  })

  // Get like + comment counts per slug
  const slugs = postsAnalytics.map((p) => p.postSlug)

  const likeCounts = await prisma.like.groupBy({
    by: ["postSlug"],
    _count: true,
    where: { postSlug: { in: slugs } },
  })

  const commentCounts = await prisma.comment.groupBy({
    by: ["postSlug"],
    _count: true,
    where: { postSlug: { in: slugs }, isDeleted: false },
  })

  const likeMap = Object.fromEntries(likeCounts.map((l) => [l.postSlug, l._count]))
  const commentMap = Object.fromEntries(commentCounts.map((c) => [c.postSlug, c._count]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Posts</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Analytics and performance for all published posts
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Post
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Views
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Unique
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Likes
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Comments
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Read Depth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {postsAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    No analytics data yet. Page views will appear here once visitors start reading.
                  </td>
                </tr>
              ) : (
                postsAnalytics.map((post) => (
                  <tr key={post.postSlug} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                        {post.postSlug.replace(/-/g, " ")}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono">
                        /blog/{post.postSlug}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-[var(--text-primary)] tabular-nums">
                      {post.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)] tabular-nums">
                      {post.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)] tabular-nums">
                      {(likeMap[post.postSlug] || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)] tabular-nums">
                      {(commentMap[post.postSlug] || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--color-brand-500)]"
                            style={{ width: `${Math.round(post.avgReadDepth * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] tabular-nums w-8 text-right">
                          {Math.round(post.avgReadDepth * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
