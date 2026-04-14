import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"

export default async function AdminDashboardPage() {
  const session = await auth()

  // Fetch analytics data
  const [totalViews, totalLikes, totalComments, recentComments, topPosts] =
    await Promise.all([
      prisma.postAnalytics.aggregate({ _sum: { viewCount: true } }),
      prisma.like.count(),
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.comment.findMany({
        where: { isDeleted: false },
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.postAnalytics.findMany({
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
    ])

  const stats = [
    {
      label: "Total Views",
      value: (totalViews._sum.viewCount || 0).toLocaleString(),
      icon: "👁️",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: "❤️",
      color: "from-rose-500 to-rose-600",
    },
    {
      label: "Comments",
      value: totalComments.toLocaleString(),
      icon: "💬",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Top Post Views",
      value: (topPosts[0]?.viewCount || 0).toLocaleString(),
      icon: "🏆",
      color: "from-amber-500 to-amber-600",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-5 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {stat.label}
              </span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Top Posts by Views
          </h2>
          <div className="space-y-3">
            {topPosts.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">
                No analytics data yet
              </p>
            ) : (
              topPosts.map((post, i) => (
                <div
                  key={post.postSlug}
                  className="flex items-center gap-3 py-2"
                >
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {post.postSlug.replace(/-/g, " ")}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)] tabular-nums">
                    {post.viewCount.toLocaleString()} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Recent Comments
          </h2>
          <div className="space-y-4">
            {recentComments.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] py-4 text-center">
                No comments yet
              </p>
            ) : (
              recentComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {comment.user.avatarUrl ? (
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.name || ""}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(comment.user.name || "U")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-[var(--text-primary)]">
                        {comment.user.name || "Anonymous"}
                      </span>
                      <span className="text-[var(--text-tertiary)]">
                        {" "}
                        on {comment.postSlug.replace(/-/g, " ")}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
