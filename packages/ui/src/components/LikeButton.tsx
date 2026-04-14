"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface LikeButtonProps {
  postSlug: string
  apiBase: string
  className?: string
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  postSlug,
  apiBase,
  className,
}) => {
  const [liked, setLiked] = React.useState(false)
  const [count, setCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Fetch initial state
  React.useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(
          `${apiBase}/api/likes?postSlug=${encodeURIComponent(postSlug)}`,
          { credentials: "include" },
        )
        if (res.ok) {
          const data = await res.json()
          setCount(data.count)
          setLiked(data.userLiked)
        }
      } catch {
        // Silently fail — likes are non-critical
      }
    }
    fetchLikes()
  }, [apiBase, postSlug])

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    setIsAnimating(true)

    // Optimistic update
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    try {
      const res = await fetch(`${apiBase}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postSlug }),
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      } else if (res.status === 401) {
        // Not authenticated — revert and redirect
        setLiked(prevLiked)
        setCount(prevCount)
        window.location.href = `${apiBase}/login?callbackUrl=${encodeURIComponent(window.location.href)}`
      } else {
        // Revert on error
        setLiked(prevLiked)
        setCount(prevCount)
      }
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "group inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)]",
        "border transition-all duration-[var(--transition-base)]",
        "focus-ring cursor-pointer select-none",
        liked
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
          : "bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-red-300 hover:text-red-500",
        isLoading && "opacity-70",
        className,
      )}
      aria-label={liked ? `Unlike this post (${count} likes)` : `Like this post (${count} likes)`}
      aria-pressed={liked}
    >
      {/* Heart Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={cn(
          "h-5 w-5 transition-transform duration-300",
          liked ? "fill-current" : "fill-none stroke-current stroke-2",
          isAnimating && "animate-[heartBeat_0.6s_ease-in-out]",
        )}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      <span className="text-[var(--text-sm)] font-medium tabular-nums">
        {count}
      </span>

      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  )
}
