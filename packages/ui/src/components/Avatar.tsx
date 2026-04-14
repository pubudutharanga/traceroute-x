"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const avatarSizes = {
  sm: "h-8 w-8 text-[var(--text-xs)]",
  md: "h-10 w-10 text-[var(--text-sm)]",
  lg: "h-12 w-12 text-[var(--text-base)]",
  xl: "h-16 w-16 text-[var(--text-lg)]",
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", fallback, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const initials = React.useMemo(() => {
      if (fallback) return fallback.slice(0, 2).toUpperCase()
      if (alt) {
        return alt
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      }
      return "?"
    }, [fallback, alt])

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-[var(--radius-full)] overflow-hidden flex-shrink-0",
          "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]",
          "dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-300)]",
          avatarSizes[size],
          className,
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-semibold select-none">{initials}</span>
        )}
      </div>
    )
  },
)

Avatar.displayName = "Avatar"
