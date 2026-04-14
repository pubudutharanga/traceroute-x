"use client"

import React from "react"
import { useRouter } from "next/navigation"

export default function CreateAuthorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirmPassword = form.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          username: form.get("username"),
          email: form.get("email"),
          password,
          bio: form.get("bio"),
        }),
      })

      if (res.ok) {
        router.push("/admin/users")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create author")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Author</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Create a new author account with credentials login
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-error)] text-[var(--text-error)] text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6 space-y-5">
        <div>
          <label htmlFor="ca-displayName" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Display Name *
          </label>
          <input
            id="ca-displayName"
            name="displayName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
            placeholder="Alex Chen"
          />
        </div>

        <div>
          <label htmlFor="ca-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Email *
          </label>
          <input
            id="ca-email"
            name="email"
            type="email"
            required
            className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
            placeholder="author@traceroutex.com"
          />
        </div>

        <div>
          <label htmlFor="ca-username" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Username *
          </label>
          <input
            id="ca-username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-z0-9_]+$"
            className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent font-mono"
            placeholder="alexchen"
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Lowercase letters, numbers, and underscores only
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ca-password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Password *
            </label>
            <input
              id="ca-password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="ca-confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Confirm Password *
            </label>
            <input
              id="ca-confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] -mt-3">
          Min 8 characters. Must contain uppercase, lowercase, and a number.
        </p>

        <div>
          <label htmlFor="ca-bio" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Bio
          </label>
          <textarea
            id="ca-bio"
            name="bio"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent resize-y"
            placeholder="A short bio about this author..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="h-10 px-6 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white text-sm font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create Author"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-4 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
