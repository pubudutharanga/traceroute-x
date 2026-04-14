import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminSettingsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin/dashboard")

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Configure site-wide settings
        </p>
      </div>

      {/* Site Info */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Site Information</h2>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Site Name</label>
          <input
            type="text"
            defaultValue="TraceRoute X"
            className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Site Description</label>
          <textarea
            rows={2}
            defaultValue="A technology blog exploring modern web development, cloud architecture, and engineering best practices."
            className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] resize-y"
          />
        </div>

        <button className="h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white text-sm font-medium hover:bg-[var(--color-brand-700)] transition-colors cursor-pointer">
          Save Changes
        </button>
      </div>

      {/* Moderation */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Comment Moderation</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--border-primary)] text-[var(--color-brand-600)] focus:ring-[var(--border-focus)]"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Require approval before publishing</p>
            <p className="text-xs text-[var(--text-tertiary)]">New comments will be set to PENDING until approved by an admin</p>
          </div>
        </label>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          These actions are irreversible. Proceed with caution.
        </p>
        <button className="h-10 px-4 rounded-[var(--radius-md)] border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer">
          Purge All Analytics Data
        </button>
      </div>
    </div>
  )
}
