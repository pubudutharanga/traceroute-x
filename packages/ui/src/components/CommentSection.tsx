"use client"

import React from "react"
import { cn } from "../lib/utils"

// ---- Types ----

interface CommentUser {
  id: string
  name: string | null
  avatarUrl: string | null
}

interface CommentData {
  id: string
  content: string
  createdAt: string
  user: CommentUser
  replies?: CommentData[]
  isDeleted: boolean
}

export interface CommentSectionProps {
  postSlug: string
  apiBase: string
  className?: string
}

// ---- Main Section ----

export const CommentSection: React.FC<CommentSectionProps> = ({
  postSlug,
  apiBase,
  className,
}) => {
  const [comments, setComments] = React.useState<CommentData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(
        `${apiBase}/api/comments?postSlug=${encodeURIComponent(postSlug)}`,
        { credentials: "include" },
      )
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch {
      setError("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }, [apiBase, postSlug])

  React.useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (content: string, parentId?: string) => {
    try {
      const res = await fetch(`${apiBase}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postSlug, content, parentId }),
      })

      if (res.status === 401) {
        window.location.href = `${apiBase}/login?callbackUrl=${encodeURIComponent(window.location.href)}`
        return
      }

      if (res.ok) {
        await fetchComments()
        setReplyingTo(null)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to post comment")
      }
    } catch {
      setError("Failed to post comment")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    try {
      const res = await fetch(`${apiBase}/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        await fetchComments()
      }
    } catch {
      setError("Failed to delete comment")
    }
  }

  return (
    <section
      className={cn("space-y-6", className)}
      aria-label="Comments"
      id="comments"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
          Comments
        </h2>
        <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-[var(--radius-full)] bg-[var(--bg-tertiary)] text-[var(--text-xs)] font-medium text-[var(--text-secondary)]">
          {comments.length}
        </span>
      </div>

      {/* New Comment Form */}
      <CommentForm onSubmit={(content) => handleSubmit(content)} />

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-error)] text-[var(--text-error)] text-[var(--text-sm)]">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-[var(--bg-tertiary)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-[var(--bg-tertiary)]" />
                <div className="h-4 w-full rounded bg-[var(--bg-tertiary)]" />
                <div className="h-4 w-3/4 rounded bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments List */}
      {!isLoading && comments.length === 0 && (
        <p className="text-[var(--text-secondary)] text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
            onDelete={handleDelete}
            replyingTo={replyingTo}
            onSubmitReply={(content, parentId) => handleSubmit(content, parentId)}
          />
        ))}
      </div>
    </section>
  )
}

// ---- Comment Item ----

interface CommentItemProps {
  comment: CommentData
  depth?: number
  onReply: (id: string) => void
  onDelete: (id: string) => void
  replyingTo: string | null
  onSubmitReply: (content: string, parentId: string) => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  onReply,
  onDelete,
  replyingTo,
  onSubmitReply,
}) => {
  if (comment.isDeleted) {
    return (
      <div className={cn("py-3 text-[var(--text-tertiary)] italic text-[var(--text-sm)]", depth > 0 && "ml-12")}>
        This comment has been deleted.
      </div>
    )
  }

  const timeAgo = getTimeAgo(comment.createdAt)

  return (
    <div className={cn("group", depth > 0 && "ml-12 pl-4 border-l-2 border-[var(--border-primary)]")}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.name || "User"}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center font-semibold text-[var(--text-sm)]">
              {(comment.user.name || "U")[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[var(--text-primary)] text-[var(--text-sm)]">
              {comment.user.name || "Anonymous"}
            </span>
            <span className="text-[var(--text-tertiary)] text-[var(--text-xs)]">
              {timeAgo}
            </span>
          </div>

          <p className="text-[var(--text-secondary)] text-[var(--text-sm)] leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-fast)]">
            {depth < 3 && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-[var(--text-xs)] text-[var(--text-tertiary)] hover:text-[var(--text-link)] transition-colors cursor-pointer"
              >
                Reply
              </button>
            )}
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[var(--text-xs)] text-[var(--text-tertiary)] hover:text-[var(--text-error)] transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <CommentForm
                onSubmit={(content) => onSubmitReply(content, comment.id)}
                onCancel={() => onReply(comment.id)}
                placeholder={`Reply to ${comment.user.name || "Anonymous"}...`}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              replyingTo={replyingTo}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Comment Form ----

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void> | void
  onCancel?: () => void
  placeholder?: string
  compact?: boolean
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts...",
  compact = false,
}) => {
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 4}
        maxLength={2000}
        className={cn(
          "w-full px-3 py-2 rounded-[var(--radius-md)]",
          "bg-[var(--bg-primary)] text-[var(--text-primary)]",
          "border border-[var(--border-primary)]",
          "placeholder:text-[var(--text-tertiary)]",
          "transition-colors duration-[var(--transition-fast)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent",
          "resize-y text-[var(--text-sm)]",
        )}
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={cn(
            "h-8 px-4 rounded-[var(--radius-md)] text-[var(--text-sm)] font-medium",
            "bg-[var(--color-brand-600)] text-white",
            "hover:bg-[var(--color-brand-700)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-[var(--transition-fast)] cursor-pointer",
          )}
        >
          {isSubmitting ? "Posting..." : compact ? "Reply" : "Post Comment"}
        </button>
      </div>
    </form>
  )
}

// ---- Utility ----

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: diffDay > 365 ? "numeric" : undefined })
}
