import { prisma } from "@traceroutex/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DeleteUserButton } from "./DeleteUserButton"

export default async function AdminUsersPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin/dashboard")

  const users = await prisma.user.findMany({
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
      author: { select: { displayName: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    AUTHOR: "bg-blue-100 text-blue-700",
    USER: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage user accounts and author profiles
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white text-sm font-medium hover:bg-[var(--color-brand-700)] transition-colors shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Author
        </Link>
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Provider</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center font-semibold text-sm">
                          {(user.name || user.email)[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {user.name || "—"}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                        {user.username && (
                          <p className="text-xs text-[var(--text-tertiary)] font-mono">@{user.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${roleColors[user.role] || ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {user.provider}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-tertiary)]">
                    {user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {session?.user?.id !== user.id && (
                      <DeleteUserButton userId={user.id} userName={user.name || user.email} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
